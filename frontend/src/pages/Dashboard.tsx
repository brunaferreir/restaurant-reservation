import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Utensils, Calendar, TrendingUp } from "lucide-react";

interface Stats {
  totalClientes: number;
  totalMesas: number;
  totalReservas: number;
  mesasDisponiveis: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalClientes: 0,
    totalMesas: 0,
    totalReservas: 0,
    mesasDisponiveis: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientes, mesas, reservas] = await Promise.all([
          fetch("http://localhost:5000/api/clientes/").then(r => r.json()),
          fetch("http://localhost:5000/api/mesas/").then(r => r.json()),
          fetch("http://localhost:5000/api/reservas/").then(r => r.json()),
        ]);

        setStats({
          totalClientes: clientes.length,
          totalMesas: mesas.length,
          totalReservas: reservas.length,
          mesasDisponiveis: mesas.filter((m: any) => m.disponivel).length,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total de Clientes",
      value: stats.totalClientes,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Mesas Disponíveis",
      value: stats.mesasDisponiveis,
      icon: Utensils,
      color: "text-accent",
    },
    {
      title: "Total de Reservas",
      value: stats.totalReservas,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Total de Mesas",
      value: stats.totalMesas,
      icon: TrendingUp,
      color: "text-muted-foreground",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
