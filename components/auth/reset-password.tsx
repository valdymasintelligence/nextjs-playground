"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/supabase/client";
import { signOut } from "@/app/actions/auth";
import { toast } from "react-toastify";
import { WithActions } from "@/components/general/toastify";
import { redirect, useSearchParams } from "next/navigation";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(32, "Password must not exceed 32 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = ({ token }: { token: string }) => {
  const supabase = createClient();

  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const token_hash = searchParams.get("token_hash");

    if (!token_hash) {
      // setError('Invalid reset link');
      console.error(token, "Invalid reset link");
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash,
    });

    if (verifyError) console.error({ verifyError });

    const { error } = await supabase.auth.updateUser({
      password: data.confirmPassword,
    });

    if (error) {
      toast(WithActions, {
        data: {
          content:
            error.message ===
            "New password should be different from the old password."
              ? "New password should be different from the old password."
              : "Error Resetting Password",
          title: "Error Resetting Password",
        },
        ariaLabel: "Message archived",
        className: "w-[400px]",
        autoClose: false,
        closeButton: false,
        position: "bottom-right",
      });
    } else {
      toast(WithActions, {
        data: {
          title: "Password Reset Successful",
          content: "sign in with your new password",
        },
        ariaLabel: "Message archived",
        className: "w-[400px]",
        autoClose: false,
        closeButton: false,
        position: "bottom-right",
      });
      await signOut();
      redirect("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full ">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <div className="w-full ">
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium">
            New Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Reset Password
        </button>
      </div>
    </form>
  );
};

export default ResetPassword;
