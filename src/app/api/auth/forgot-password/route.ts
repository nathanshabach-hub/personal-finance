import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { forgotPasswordSchema } from "@/validators/auth";

export async function POST(request: Request) {
  try {
    await parseBody(request, forgotPasswordSchema);
    return ok({
      message:
        "If your email is registered, a password reset link will be sent. Configure an email provider to activate this flow.",
    });
  } catch (error) {
    return fail(error);
  }
}
