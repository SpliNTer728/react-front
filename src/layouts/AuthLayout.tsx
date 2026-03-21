import { Outlet } from 'react-router-dom'
import type { PropsWithChildren } from 'react'

type AuthLayoutProps = PropsWithChildren<{
    title?: string
    description?: string
}>

export function AuthCard({ title, description, children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#504e6e] p-6 md:p-10">
            <div className="w-full max-w-md">
                <div className="rounded-xl bg-white text-gray-900 shadow-2xl">
                    {(title || description) && (
                        <div className="px-10 pt-8 pb-0 text-center">
                            {title && <h1 className="text-xl font-semibold">{title}</h1>}
                            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                        </div>
                    )}
                    <div className="px-10 py-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AuthLayout() {
    return <Outlet />
}
