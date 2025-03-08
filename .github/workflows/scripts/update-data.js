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

// Função para buscar dados de um FII específico
async function fetchFIIData(ticker) {
    try {
        // Aqui você usaria uma API real ou web scraping
        // Por exemplo, usando o Status Invest (não oficial)
        const url = `https://statusinvest.com.br/fundos-imobiliarios/${ticker.toLowerCase()}`;
        
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // Extrair dados usando cheerio
        const price = parseFloat($('.value[data-value]').first().attr('data-value')) || 0;
        const dy = parseFloat($('.indicator-today-dy strong').text().replace(',', '.').replace('%', '')) || 0;
        const pvp = parseFloat($('.indicator-today-p-vp strong').text().replace(',', '.')) || 0;
        
        // Extrair último dividendo
        const lastDiv = parseFloat($('.table-value').first().text().replace('R$', '').replace(',', '.').trim()) || 0;
        
        // Calcular preço justo (exemplo simplificado)
        const fairPrice = (price / pvp).toFixed(2);
        
        return {
            ticker,
            segment: SEGMENTS[ticker] || 'Outros',
            price: price.toFixed(2),
            dy: dy.toFixed(1),
            lastDiv: lastDiv.toFixed(2),
            pvp: pvp.toFixed(2),
            fairPrice,
            vacancy: 'N/A',  // Dados de vacância precisariam de outra fonte
            lastUpdate: new Date().toISOString()
        };
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
    
    // Limita requisições para evitar bloqueio (5 por vez)
    const batchSize = 5;
    for (let i = 0; i < FIIS_TO_TRACK.length; i += batchSize) {
        const batch = FIIS_TO_TRACK.slice(i, i + batchSize);
        console.log(`Processando lote ${i/batchSize + 1}/${Math.ceil(FIIS_TO_TRACK.length/batchSize)}`);
        
        const batchResults = await Promise.all(batch.map(ticker => fetchFIIData(ticker)));
        fiisData.push(...batchResults);
        
        // Pausa entre lotes para evitar bloqueio
        if (i + batchSize < FIIS_TO_TRACK.length) {
            console.log('Aguardando 3 segundos antes do próximo lote...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
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
