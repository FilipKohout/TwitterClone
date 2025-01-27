import React from "react";
import MessageList from "@/app/components/messages/MessageList";

export default async function MessagesPage() {
    return (
        <div className="flex flex-col content-center items-center">
            <MessageList />
        </div>
    );
}