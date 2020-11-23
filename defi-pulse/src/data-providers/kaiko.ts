import { Requester } from '@chainlink/external-adapter'
import { Index } from '../adapter'
import { util } from '@chainlink/ea-bootstrap'

const getPriceData = async (symbol: string) => {
  const url = `https://us.market-api.kaiko.io/v2/data/trades.v1/spot_exchange_rate/${symbol.toLowerCase()}/usd`
  const params = {
    sort: 'desc',
  }
  const headers = {
    'X-Api-Key': util.getRequiredEnv('API_KEY'),
    'User-Agent': 'Chainlink',
  }
  const timeout = 5000
  const config = {
    url,
    params,
    headers,
    timeout,
  }
  const response = await Requester.request(config)
  return response.data
}

const toAssetPrice = (data: Record<string, any>) => {
  const price = data.data[0] && data.data[0].price
  if (!price || price <= 0) {
    throw new Error('invalid price')
  }
  return price
}

const getPriceIndex = async (index: Index): Promise<Index> => {
  await Promise.all(
    index.map(async (i) => {
      // Particular for the Kaiko API only
      const asset = i.asset === 'UNI' ? 'uniswap' : i.asset
      const data = await getPriceData(asset)
      i.priceData = data
      i.price = toAssetPrice(data)
    }),
  )
  return index
}

export default { getPriceIndex }
