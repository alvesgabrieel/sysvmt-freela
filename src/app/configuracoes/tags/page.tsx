import Metrics from "@/app/components/metrics";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";

import RegisterTagDialog from "./components/register-tag-dialog";

const tags = () => {
    return ( 
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-6 space-y-6">
                {/* Barra de cima  */}
                <TopBar />
                {/* Cards de métricas */}
                <Metrics />
                <RegisterTagDialog />
            </div>
        </div>
     );
}
 
export default tags;