"use client";

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Option {
    id: string | number
    label: string
}

interface DynamicSelectProps {
    value: string
    onChange: (value: string) => void
    options: Option[]
    placeholder?: string
    label: string // e.g. "Categoria"
    onCreate: (name: string) => Promise<any> // Returns the created item
}

export function DynamicSelect({
    value,
    onChange,
    options,
    placeholder,
    label,
    onCreate,
}: DynamicSelectProps) {
    const [open, setOpen] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newItemName, setNewItemName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!newItemName) return
        try {
            setLoading(true)
            const newItem = await onCreate(newItemName)
            // Assuming onCreate returns the new item with an id
            if (newItem && newItem.id) {
                onChange(newItem.id.toString())
            }
            setDialogOpen(false)
            setNewItemName("")
        } catch (error) {
            console.error("Error creating item:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Select
                value={value}
                onValueChange={(val) => {
                    if (val === "___create_new___") {
                        setDialogOpen(true)
                        // Don't change the value to ___create_new___
                    } else {
                        onChange(val)
                    }
                }}
                open={open}
                onOpenChange={setOpen}
            >
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id.toString()}>
                            {opt.label}
                        </SelectItem>
                    ))}
                    <SelectItem
                        value="___create_new___"
                        className="text-primary focus:text-primary font-medium border-t mt-1"
                    >
                        <div className="flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Criar nova {label}
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova {label}</DialogTitle>
                        <DialogDescription>
                            Crie uma nova {label.toLowerCase()} para usar no sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder={`Nome da ${label.toLowerCase()}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleCreate()
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} disabled={loading || !newItemName.trim()}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
