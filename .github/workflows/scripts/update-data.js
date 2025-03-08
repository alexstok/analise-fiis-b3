const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Lista de FIIs para monitorar
const FIIS_TO_TRACK = [
    'MXRF11', 'KNCR11', 'HGLG11', 'VISC11', 'XPLG11', 
    'HGRE11', 'XPML11', 'RECT11', 'BCFF11', 'IRDM11',
    'HFOF11', 'RZTR11', 'VGIP11', 'KNRI11', 'RBRR11',
    'VINO11', 'VILG11', 'HCTR11', 'VRTA11', 'HSML11',
    'BTLG11', 'RBRF11', 'VGHF11', 'RVBI11', 'XPCI11',
    'HGBS11', 'RECR11', 'BRCR11', 'TRXF11', 'TGAR11'
];

// Mapeamento de segmentos
const SEGMENTS = {
    'MXRF11': 'Recebíveis', 'KNCR11': 'Recebíveis', 'HGLG11': 'Logístico',
    'VISC11': 'Shopping', 'XPLG11': 'Logístico', 'HGRE11': 'Escritórios',
    'XPML11': 'Shopping', 'RECT11': 'Recebíveis', 'BCFF11': 'Fundo de Fundos',
    'IRDM11': 'Recebíveis', 'HFOF11': 'Fundo de Fundos', 'RZTR11': 'Recebíveis',
    'VGIP11': 'Recebíveis', 'KNRI11': 'Híbrido', 'RBRR11': 'Recebíveis',
    'VINO11': 'Híbrido', 'VILG11': 'Logístico', 'HCTR11': 'Recebíveis',
    'VRTA11': 'Recebíveis', 'HSML11': 'Shopping', 'BTLG11': 'Logístico',
    'RBRF11': 'Fundo de Fundos', 'VGHF11': 'Fundo de Fundos', 'RVBI11': 'Recebíveis',
    'XPCI11': 'Recebíveis', 'HGBS11': 'Shopping', 'RECR11': 'Recebíveis',
    'BRCR11': 'Escritórios', 'TRXF11': 'Recebíveis', 'TGAR11': 'Logístico'
};

// Dados de vacância (exemplo - você precisará atualizar com dados reais)
const VACANCY_DATA = {
    'HGLG11': 3.2, 'XPLG11': 2.9, 'HGRE11': 12.8, 'VISC11': 5.1,
    'XPML11': 4.8, 'KNRI11': 7.2, 'HSML11': 3.9, 'BTLG11': 0.5,
    'BRCR11': 15.3, 'HGBS11': 4.2, 'VILG11': 1.8
};

// Função para buscar dados de um FII específico
async function fetchFIIData(ticker) {
    try {
        // Em um ambiente real, você usaria uma API ou web scraping
        // Por enquanto, vamos usar dados simulados realistas
        return simulateFIIData(ticker);
    } catch (error) {
        console.error(`Erro ao buscar dados para ${ticker}:`, error.message);
        // Retorna dados vazios em caso de erro
        return {
            ticker,
            segment: SEGMENTS[ticker] || 'Outros',
            price: '0.00',
            dy: '0.0',
            lastDiv: '0.00',
            pvp: '0.00',
            fairPrice: '0.00',
            vacancy: 'N/A',
            lastUpdate: new Date().toISOString(),
            error: true
        };
    }
}

// Função que simula dados realistas para os FIIs
function simulateFIIData(ticker) {
    // Dados base realistas para os FIIs
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

    // Se não temos dados para este ticker, gera dados aleatórios
    if (!baseData[ticker]) {
        const price = (Math.random() * 15 + 7).toFixed(2);
        const dy = (Math.random() * 10 + 5).toFixed(1);
        const lastDiv = (parseFloat(price) * (Math.random() * 0.01 + 0.005)).toFixed(2);
        const pvp = (Math.random() * 0.3 + 0.7).toFixed(2);
        const fairPrice = (parseFloat(price) * (Math.random() * 0.3 + 0.9)).toFixed(2);
        
        return {
            ticker,
            segment: SEGMENTS[ticker] || 'Outros',
            price,
            dy,
            lastDiv,
            pvp,
            fairPrice,
            vacancy: VACANCY_DATA[ticker] || 'N/A',
            lastUpdate: new Date().toISOString()
        };
    }

    // Adiciona pequena variação aleatória para simular dados em tempo real
    const data = baseData[ticker];
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
        vacancy: VACANCY_DATA[ticker] || 'N/A',
        lastUpdate: new Date().toISOString()
    };
}

// Função principal
async function main() {
    console.log('Iniciando atualização de dados dos FIIs...');
    
    // Cria diretório de dados se não existir
    const dataDir = path.join(__dirname, '../../docs/data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Busca dados para cada FII
    const fiisData = [];
    
    // Processa todos os FIIs
    for (const ticker of FIIS_TO_TRACK) {
        console.log(`Processando ${ticker}...`);
        const data = await fetchFIIData(ticker);
        fiisData.push(data);
    }
    
    // Salva os dados em um arquivo JSON
    const dataFilePath = path.join(dataDir, 'fiis-data.json');
    fs.writeFileSync(dataFilePath, JSON.stringify({
        lastUpdate: new Date().toISOString(),
        data: fiisData
    }, null, 2));
    
    console.log(`Dados atualizados e salvos em ${dataFilePath}`);
}

// Executa o script
main().catch(error => {
    console.error('Erro na execução do script:', error);
    process.exit(1);
});
