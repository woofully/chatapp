"use server";

import { getServerSession } from "next-auth";
import { prisma } from "./lib/db";
import { authOptions } from "./lib/auth";

export async function postData(formdata: FormData) {
  "use server";

  const Pusher = require("pusher");

  const session = await getServerSession(authOptions);
  const message = formdata.get("message");

  const data = await prisma.message.create({
    data: {
      message: message as string,
      email: session?.user?.email,
    },
    include: {
      User: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: "ap1",
    useTLS: true,
  });

  await pusher.trigger("chat", "hello", {
    message: `${JSON.stringify(data)}\n\n`,
  });
}
