import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Mesa {
  id: number;
  numero: number;
  capacidade: number;
  disponivel: boolean;
}

const Mesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  const [formData, setFormData] = useState({ numero: "", capacidade: "", disponivel: true });
  const { toast } = useToast();

  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/mesas/");
      const data = await response.json();
      setMesas(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao carregar mesas" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingMesa
      ? `http://localhost:5000/api/mesas/${editingMesa.id}`
      : "http://localhost:5000/api/mesas/";
    const method = editingMesa ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: parseInt(formData.numero),
          capacidade: parseInt(formData.capacidade),
          disponivel: formData.disponivel,
        }),
      });

      if (response.ok) {
        toast({
          title: editingMesa ? "Mesa atualizada" : "Mesa criada",
          description: "Operação realizada com sucesso",
        });
        setIsDialogOpen(false);
        setEditingMesa(null);
        setFormData({ numero: "", capacidade: "", disponivel: true });
        fetchMesas();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro na operação" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta mesa?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/mesas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Mesa excluída com sucesso" });
        fetchMesas();
      } else {
        const data = await response.json();
        toast({ variant: "destructive", title: "Erro ao excluir", description: data.erro });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro na operação" });
    }
  };

  const openEditDialog = (mesa: Mesa) => {
    setEditingMesa(mesa);
    setFormData({
      numero: mesa.numero.toString(),
      capacidade: mesa.capacidade.toString(),
      disponivel: mesa.disponivel,
    });
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Mesas</h2>
            <p className="text-muted-foreground mt-1">Gerencie as mesas do restaurante</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingMesa(null); setFormData({ numero: "", capacidade: "", disponivel: true }); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Mesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMesa ? "Editar Mesa" : "Nova Mesa"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    type="number"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    value={formData.capacidade}
                    onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="disponivel">Disponível</Label>
                  <Switch
                    id="disponivel"
                    checked={formData.disponivel}
                    onCheckedChange={(checked) => setFormData({ ...formData, disponivel: checked })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingMesa ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mesas.map((mesa) => (
                <TableRow key={mesa.id}>
                  <TableCell className="font-medium">Mesa {mesa.numero}</TableCell>
                  <TableCell>{mesa.capacidade} pessoas</TableCell>
                  <TableCell>
                    <Badge variant={mesa.disponivel ? "default" : "secondary"}>
                      {mesa.disponivel ? "Disponível" : "Ocupada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(mesa)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(mesa.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Mesas;
