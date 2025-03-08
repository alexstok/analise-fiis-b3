// Função para buscar dados de FIIs do arquivo JSON
async function fetchFIIsData() {
    try {
        // Busca dados do arquivo JSON atualizado pelo GitHub Actions
        const response = await fetch('data/fiis-data.json');
        const jsonData = await response.json();
        
        // Se os dados existirem e forem válidos
        if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
            return jsonData.data;
        }
        
        // Caso contrário, usa dados simulados
        console.warn("Usando dados simulados porque o arquivo JSON não contém dados válidos");
        return await simulateAPIData();
    } catch (error) {
        console.error("Erro ao buscar dados do arquivo JSON:", error);
        // Em caso de erro, usa dados simulados
        console.warn("Usando dados simulados devido a erro");
        return await simulateAPIData();
    }
}

// Função que simula dados da API (substitua por chamadas reais)
async function simulateAPIData() {    // Dados simulados para os FIIs
    const baseData = {
        'MXRF11': { price: 9.80, dy: 12.6, lastDiv: 0.09, pvp: 0.95, fairPrice: 10.30 },
        'KNCR11': { price: 10.12, dy: 13.1, lastDiv: 0.11, pvp: 0.98, fairPrice: 10.35 },
        'HGLG11': { price: 15.80, dy: 9.2, lastDiv: 0.12, pvp: 0.82, fairPrice: 19.25 },
        'VISC11': { price: 11.15, dy: 8.7, lastDiv: 0.08, pvp: 0.88, fairPrice: 12.65 },
        'XPLG11': { price: 10.45, dy: 9.3, lastDiv: 0.08, pvp: 0.85, fairPrice: 12.30 },
        'HGRE11': { price: 12.50, dy: 8.5, lastDiv: 0.09, pvp: 0.80, fairPrice: 15.60 },
        'XPML11': { price: 10.80, dy: 8.4, lastDiv: 0.07, pvp: 0.83, fairPrice: 13.00 },
        'RECT11': { price: 17.20, dy: 12.2, lastDiv: 0.17, pvp: 0.97, fairPrice: 17.75 },
        'BCFF11': { price: 7.40, dy: 10.5, lastDiv: 0.06, pvp: 0.91, fairPrice: 8.15 },
        'IRDM11': { price: 10.30, dy: 14.2, lastDiv: 0.12, pvp: 0.99, fairPrice: 10.40 },
        'HFOF11': { price: 7.25, dy: 9.8, lastDiv: 0.06, pvp: 0.93, fairPrice: 7.80 },
        'RZTR11': { price: 8.70, dy: 15.1, lastDiv: 0.11, pvp: 0.96, fairPrice: 9.05 },
        'VGIP11': { price: 9.95, dy: 13.7, lastDiv: 0.11, pvp: 0.97, fairPrice: 10.25 },
        'KNRI11': { price: 17.10, dy: 8.4, lastDiv: 0.12, pvp: 0.81, fairPrice: 21.10 },
        'RBRR11': { price: 9.45, dy: 12.8, lastDiv: 0.10, pvp: 0.96, fairPrice: 9.85 },
        'VINO11': { price: 8.60, dy: 9.5, lastDiv: 0.07, pvp: 0.84, fairPrice: 10.25 },
        'VILG11': { price: 11.30, dy: 8.8, lastDiv: 0.08, pvp: 0.86, fairPrice: 13.15 },
        'HCTR11': { price: 11.75, dy: 13.5, lastDiv: 0.13, pvp: 0.97, fairPrice: 12.10 },
        'VRTA11': { price: 10.20, dy: 14.0, lastDiv: 0.12, pvp: 0.98, fairPrice: 10.40 },
        'HSML11': { price: 9.85, dy: 7.9, lastDiv: 0.06, pvp: 0.82, fairPrice: 12.00 },
        'BTLG11': { price: 11.40, dy: 8.2, lastDiv: 0.08, pvp: 0.83, fairPrice: 13.75 },
        'RBRF11': { price: 7.15, dy: 10.2, lastDiv: 0.06, pvp: 0.92, fairPrice: 7.75 },
        'VGHF11': { price: 9.30, dy: 9.9, lastDiv: 0.08, pvp: 0.94, fairPrice: 9.90 },
        'RVBI11': { price: 9.75, dy: 13.2, lastDiv: 0.11, pvp: 0.97, fairPrice: 10.05 },
        'XPCI11': { price: 9.60, dy: 13.8, lastDiv: 0.11, pvp: 0.98, fairPrice: 9.80 },
        'HGBS11': { price: 16.80, dy: 7.8, lastDiv: 0.11, pvp: 0.81, fairPrice: 20.75 },
        'RECR11': { price: 9.90, dy: 12.5, lastDiv: 0.10, pvp: 0.96, fairPrice: 10.30 },
        'BRCR11': { price: 7.80, dy: 8.1, lastDiv: 0.05, pvp: 0.78, fairPrice: 10.00 },
        'TRXF11': { price: 9.50, dy: 13.0, lastDiv: 0.10, pvp: 0.97, fairPrice: 9.80 },
        'TGAR11': { price: 12.20, dy: 8.9, lastDiv: 0.09, pvp: 0.85, fairPrice: 14.35 }
    };
    
    // Adiciona pequena variação aleatória para simular dados em tempo real
    return Object.entries(baseData).map(([ticker, data]) => {
        // Variação de até ±2% no preço
        const priceVariation = data.price * (1 + (Math.random() * 0.04 - 0.02));
        const price = priceVariation.toFixed(2);
        
        // Recalcula fairPrice com base na variação
        const fairPriceRatio = data.fairPrice / data.price;
        const fairPrice = (price * fairPriceRatio).toFixed(2);
        
        return {
            ticker,
            segment: SEGMENTS[ticker] || 'Outros',
            price,
            dy: data.dy.toFixed(1),
            lastDiv: data.lastDiv.toFixed(2),
            pvp: data.pvp.toFixed(2),
            fairPrice,
            vacancy: VACANCY_DATA[ticker] || 'N/A'
        };
    });
}

// Função para buscar dados históricos (para implementação futura)
async function fetchHistoricalData(ticker) {
    // Implementar com API real
    console.log(`Buscando dados históricos para ${ticker}`);
    return [];
}
// Adicione ao arquivo api.js

// Função para salvar dados históricos no localStorage
function saveHistoricalData(ticker, data) {
    try {
        const key = `historical_${ticker}`;
        localStorage.setItem(key, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));
    } catch (error) {
        console.error(`Erro ao salvar dados históricos para ${ticker}:`, error);
    }
}

// Função para carregar dados históricos do localStorage
function loadHistoricalData(ticker) {
    try {
        const key = `historical_${ticker}`;
        const cachedData = localStorage.getItem(key);
        
        if (!cachedData) return null;
        
        const parsed = JSON.parse(cachedData);
        const now = Date.now();
        
        // Dados históricos podem ser mantidos por 7 dias
        if (now - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
            return null;
        }
        
        return parsed.data;
    } catch (error) {
        console.error(`Erro ao carregar dados históricos para ${ticker}:`, error);
        return null;
    }
}

// Função para buscar dados históricos com cache
async function getHistoricalDataWithCache(ticker) {
    // Tenta carregar do cache primeiro
    const cachedData = loadHistoricalData(ticker);
    if (cachedData) {
        return cachedData;
    }
    
    // Se não estiver em cache, busca da API
    try {
        const data = await fetchHistoricalData(ticker);
        saveHistoricalData(ticker, data);
        return data;
    } catch (error) {
        console.error(`Erro ao buscar dados históricos para ${ticker}:`, error);
        return [];
    }
}
