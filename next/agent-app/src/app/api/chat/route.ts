import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/server/agent";

/**
 * POST 处理聊天请求
 * API Route 只负责：
 * 1. 解析请求参数
 * 2. 参数验证
 * 3. 调用 Server 层
 * 4. 返回 HTTP 响应
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    // 参数验证
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    // 调用服务层
    const result = await runAgent(message);

    // 返回结果
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.output,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
