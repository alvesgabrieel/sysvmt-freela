export const fetchStates = async () => {
    try {
        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
        const data = await response.json();
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch (error) {
        console.error("Erro ao buscar estados:", error);
        throw new Error("Erro ao buscar estados");
    }
};

export const fetchCitiesByState = async (stateId: number) => {
    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`);
        const data = await response.json();
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch (error) {
        console.error("Erro ao buscar cidades:", error);
        throw new Error("Erro ao buscar cidades");
    }
};
