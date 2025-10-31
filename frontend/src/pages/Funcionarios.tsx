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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [formData, setFormData] = useState({ nome: "", email: "", cargo: "", senha: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/funcionarios/");
      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao carregar funcionários" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingFuncionario
      ? `http://localhost:5000/api/funcionarios/${editingFuncionario.id}`
      : "http://localhost:5000/api/funcionarios/";
    const method = editingFuncionario ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingFuncionario ? "Funcionário atualizado" : "Funcionário criado",
          description: "Operação realizada com sucesso",
        });
        setIsDialogOpen(false);
        setEditingFuncionario(null);
        setFormData({ nome: "", email: "", cargo: "", senha: "" });
        fetchFuncionarios();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro na operação" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este funcionário?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/funcionarios/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Funcionário excluído com sucesso" });
        fetchFuncionarios();
      } else {
        const data = await response.json();
        toast({ variant: "destructive", title: "Erro ao excluir", description: data.erro });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro na operação" });
    }
  };

  const openEditDialog = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario);
    setFormData({
      nome: funcionario.nome,
      email: funcionario.email,
      cargo: funcionario.cargo,
      senha: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Funcionários</h2>
            <p className="text-muted-foreground mt-1">Gerencie os funcionários do sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingFuncionario(null);
                  setFormData({ nome: "", email: "", cargo: "", senha: "" });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFuncionario ? "Editar Funcionário" : "Novo Funcionário"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senha">
                    Senha {editingFuncionario && "(deixe em branco para manter)"}
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required={!editingFuncionario}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingFuncionario ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarios.map((funcionario) => (
                <TableRow key={funcionario.id}>
                  <TableCell className="font-medium">{funcionario.nome}</TableCell>
                  <TableCell>{funcionario.email}</TableCell>
                  <TableCell>{funcionario.cargo}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(funcionario)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(funcionario.id)}
                    >
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

export default Funcionarios;
