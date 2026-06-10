import { LoaderIcon } from "lucide-react";

export default function LoaderGlobal () {
    return(
        <div className="w-full h-full flex items-center justify-center">
            <LoaderIcon className="animate-spin text-xl -mt-16" />
        </div>
    )
}