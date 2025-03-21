import Metrics from "@/app/components/metrics";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";

import RegisterTicketDialog from "./components/register-ticket-dialog";

const Ingressos = () => {
    return ( 
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-6 space-y-6">
                {/* Barra de cima  */}
                <TopBar />
                {/* Cards de métricas */}
                <Metrics />
                <RegisterTicketDialog />
                
            </div>
        </div>
     );
}
 
export default Ingressos;