"use server";

import { auth } from "@clerk/nextjs";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { DeleteBoard } from "./schema";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { decrementAvailableBoards } from "@/lib/orgLimit";
import { checkSubscription } from "@/lib/subscription";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { boardId } = data;
  const isPro = await checkSubscription();

  let board;

  try {
    board = await db.board.delete({
      where: {
        id: boardId,
      },
    });

    if (!isPro) {
      await decrementAvailableBoards();
    }

    await createAuditLog({
      entityId: board.id,
      entityType: ENTITY_TYPE.LIST,
      entityTitle: board.title,
      action: ACTION.DELETE,
    });
  } catch (error) {
    return {
      error: "An error occurred",
    };
  }

  revalidatePath(`/board/${board.id}`);
  return { data: board };
};

export const deleteBoard = createSafeAction(DeleteBoard, handler);
