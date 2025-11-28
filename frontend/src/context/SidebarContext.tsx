import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextProps {
    collapsed: boolean;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);

    // Load state from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('sidebarCollapsed');
        if (stored !== null) {
            setCollapsed(stored === 'true');
        }
    }, []);

    // Persist changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', collapsed.toString());
    }, [collapsed]);

    const toggleCollapsed = () => setCollapsed(prev => !prev);

    return (
        <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
