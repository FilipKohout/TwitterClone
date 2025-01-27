"use client";

import React, { createContext, SetStateAction, useState } from "react";
import Alert from "@/app/components/utils/Alert";

export interface AlertInfo {
    id?: string;
    message: string;
    severity: 'info' | 'success' | 'warning' | 'error';
    timeout: number;
}

export interface AlertsContextValue {
    alerts: AlertInfo[];
    setAlerts: React.Dispatch<SetStateAction<AlertInfo[]>>;
    addAlert: (alert: AlertInfo) => string;
    dismissAlert: (id: string) => void;
}

export const AlertsContext = createContext<AlertsContextValue>({} as AlertsContextValue);

export const AlertsProvider = ({ children }: { children: React.ReactNode }) => {
    const [alerts, setAlerts] = useState<AlertInfo[]>([]);

    const addAlert = (alert: AlertInfo) => {
        const id = Math.random().toString(36).slice(2, 9) + new Date().getTime().toString(36);
        setAlerts((prev) => [{ ...alert, id: id }, ...prev]);
        return id;
    }

    const dismissAlert = (id: string) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }

    return (
        <AlertsContext.Provider value={{ alerts, setAlerts, addAlert, dismissAlert }}>
            <div className={"fixed top-14 z-50 pointer-events-none flex flex-col gap-1 w-screen"}>
                {alerts.map((alert) => (
                    <Alert key={alert.id} {...alert} handleDismiss={() => { alert?.id && dismissAlert(alert.id) }} />
                ))}
            </div>
            {children}
        </AlertsContext.Provider>
    );
};