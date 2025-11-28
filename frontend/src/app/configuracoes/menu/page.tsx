"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, ArrowDown, Save, RotateCcw, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { defaultMenuItems, iconMap } from "@/config/menuItems";

export default function MenuSettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [menuItems, setMenuItems] = React.useState(defaultMenuItems);
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        const savedMenu = localStorage.getItem("sidebarMenuOrder");
        if (savedMenu) {
            try {
                setMenuItems(JSON.parse(savedMenu));
            } catch (e) {
                console.error("Failed to parse saved menu order", e);
            }
        }
    }, []);

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...menuItems];
        if (direction === 'up' && index > 0) {
            [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        }
        setMenuItems(newItems);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newItems = [...menuItems];
        const draggedItem = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);

        setMenuItems(newItems);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSave = () => {
        localStorage.setItem("sidebarMenuOrder", JSON.stringify(menuItems));
        toast({
            title: "Sucesso",
            description: "Ordem do menu salva com sucesso! Recarregue a página para ver as alterações.",
        });
        // Force reload to update sidebar
        window.location.reload();
    };

    const handleReset = () => {
        setMenuItems(defaultMenuItems);
        localStorage.removeItem("sidebarMenuOrder");
        toast({
            title: "Restaurado",
            description: "Menu restaurado para o padrão.",
        });
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Personalizar Menu</h1>
                        <p className="text-muted-foreground">Organize a ordem dos itens do menu lateral</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restaurar Padrão
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Itens do Menu</CardTitle>
                    <CardDescription>
                        Arraste os itens para reordenar ou use as setas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = iconMap[item.icon] || iconMap.LayoutDashboard;
                        return (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-move ${draggedIndex === index ? 'opacity-50' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    <div className="p-2 bg-muted rounded-md">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <span className="font-medium">{item.title}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === menuItems.length - 1}
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
