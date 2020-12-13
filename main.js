/* Data Processor Actor - responsible for filtering the data from the Amazon Actor */
const Apify = require('apify');

Apify.main(async () => {

    const input = await Apify.getInput();
    const response = await Apify.client.datasets.getItems({ datasetId: input.resource.defaultDatasetId })
    const data = response.items

    console.log(`Start to process - ${data.length} products`)
    const bestOfferMap = new Map()
    for (const item of data) {
        const currentPrice = Number(item.price.replace(/\D/g,''))
        const lastItem = bestOfferMap.get(item.asin)
        if (!lastItem) {
            bestOfferMap.set(item.asin, item)
        } else {
            const lastLowestPrice = Number(lastItem.price.replace(/\D/g,''))
            if (currentPrice < lastLowestPrice) {
                bestOfferMap.set(item.asin, item)
            }
        }
    }

    const processedData = Array.from(bestOfferMap, ([_, value]) => ( value ));
    await Apify.pushData(processedData)
    console.log(`Done process to process. Filtered products - ${processedData.length}`)
});
