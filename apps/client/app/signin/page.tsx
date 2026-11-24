import type { Metadata } from "next";
import SignIn from "./signin";
import "../globals.css";
export const metadata: Metadata = { title: "Sign in · Urbaniz", robots: { index: false, follow: false } };
export default function SignInPage() { return <SignIn />; }
