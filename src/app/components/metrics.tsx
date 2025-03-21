import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Metrics = () => {
    return ( 
        <div className="grid grid-cols-4 gap-4">
          {[
            { title: "Vendas", value: "$52.6k", change: "+3.4%" },
            { title: "Vendas no mês", value: "$12.87k", change: "-2.5%" },
            { title: "Vendas feitas hoje", value: "236" },
            { title: "Vendas", value: "22" },
          ].map((card, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
                {card.change && (
                  <p className="text-sm text-green-500">{card.change}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
     );
}
 
export default Metrics;