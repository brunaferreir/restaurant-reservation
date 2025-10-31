import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Reserva {
  id: number;
  cliente_nome: string;
  mesa_numero: number;
  data_reserva: string;
  horario: string;
  status: string;
}

interface Cliente {
  id: number;
  nome: string;
}

interface Mesa {
  id: number;
  numero: number;
  disponivel: boolean;
}

const Reservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [formData, setFormData] = useState({
    cliente_id: "",
    mesa_id: "",
    data_reserva: "",
    horario: "",
    status: "confirmada",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reservasRes, clientesRes, mesasRes] = await Promise.all([
        fetch("http://localhost:5000/api/reservas/").then(r => r.json()),
        fetch("http://localhost:5000/api/clientes/").then(r => r.json()),
        fetch("http://localhost:5000/api/mesas/").then(r => r.json()),
      ]);
      setReservas(reservasRes);
      setClientes(clientesRes);
      setMesas(mesasRes);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao carregar dados" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingReserva
      ? `http://localhost:5000/api/reservas/${editingReserva.id}`
      : "http://localhost:5000/api/reservas/";
    const method = editingReserva ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: parseInt(formData.cliente_id),
          mesa_id: parseInt(formData.mesa_id),
          data_reserva: formData.data_reserva,
          horario: formData.horario,
          status: formData.status,
        }),
      });

      if (response.ok) {
        toast({
          title: editingReserva ? "Reserva atualizada" : "Reserva criada",
          description: "Operação realizada com sucesso",
        });
        setIsDialogOpen(false);
        setEditingReserva(null);
        setFormData({ cliente_id: "", mesa_id: "", data_reserva: "", horario: "", status: "confirmada" });
        fetchData();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro na operação" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta reserva?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reservas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Reserva excluída com sucesso" });
        fetchData();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro na operação" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      confirmada: "default",
      pendente: "secondary",
      cancelada: "destructive",
    };
    return <Badge variant={variants[status.toLowerCase()] || "secondary"}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Reservas</h2>
            <p className="text-muted-foreground mt-1">Gerencie as reservas do restaurante</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingReserva(null);
                  setFormData({ cliente_id: "", mesa_id: "", data_reserva: "", horario: "", status: "confirmada" });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Reserva
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingReserva ? "Editar Reserva" : "Nova Reserva"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Cliente</Label>
                  <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mesa</Label>
                  <Select value={formData.mesa_id} onValueChange={(value) => setFormData({ ...formData, mesa_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a mesa" />
                    </SelectTrigger>
                    <SelectContent>
                      {mesas.filter(m => m.disponivel).map((mesa) => (
                        <SelectItem key={mesa.id} value={mesa.id.toString()}>
                          Mesa {mesa.numero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data_reserva">Data</Label>
                  <Input
                    id="data_reserva"
                    type="date"
                    value={formData.data_reserva}
                    onChange={(e) => setFormData({ ...formData, data_reserva: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="horario">Horário</Label>
                  <Input
                    id="horario"
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingReserva ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell className="font-medium">{reserva.cliente_nome}</TableCell>
                  <TableCell>Mesa {reserva.mesa_numero}</TableCell>
                  <TableCell>{new Date(reserva.data_reserva).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{reserva.horario}</TableCell>
                  <TableCell>{getStatusBadge(reserva.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(reserva.id)}>
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

export default Reservas;
