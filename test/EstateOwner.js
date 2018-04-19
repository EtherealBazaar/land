import assertRevert from './helpers/assertRevert'
import { increaseTimeTo, duration, latestTime } from './helpers/increaseTime'

const BigNumber = web3.BigNumber

const Estate = artifacts.require('EstateOwner')
const LANDRegistry = artifacts.require('LANDRegistryTest')
const LANDProxy = artifacts.require('LANDProxy')

const NONE = '0x0000000000000000000000000000000000000000'

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

contract('LANDRegistry', accounts => {
  const [creator, user, anotherUser] = accounts

  let registry = null,
    proxy = null
  let land = null
  let estate = null

  const _name = 'Decentraland LAND'
  const _symbol = 'LAND'

  const creationParams = {
    gas: 1e8,
    gasPrice: 1e9,
    from: creator
  }
  const sentByUser = { ...creationParams, from: user }
  const sentByAnotherUser = { ...creationParams, from: anotherUser }
  const sentByCreator = { ...creationParams, from: creator }

  describe('workflow full', () => {
    it.only('allows a estate to establish ownership', async () => {
      proxy = await LANDProxy.new(creationParams)
      registry = await LANDRegistry.new(creationParams)

      await proxy.upgrade(registry.address, creator, sentByCreator)
      land = await LANDRegistry.at(proxy.address)
      await land.initialize(creator, sentByCreator)

      await land.assignMultipleParcels([0, 0, 1, 1, -3, -4], [2, -1, 1, -2, 2, 2], user, sentByCreator)

      const txReceipt = await land.createEstate([0, 1, -3], [2, 1, 2], anotherUser, sentByUser)

      let estateAddr = txReceipt.logs[0].args.to
      estate = await Estate.at(estateAddr)

      console.log('estate size', (await estate.size()).toString())
      const cuca = 'A la grande le puse cuca'
      await estate.updateMetadata(cuca, sentByAnotherUser)
        console.log('then')

      const data = await land.landData(0, 2)
      console.log(data)
    })
  })
})
