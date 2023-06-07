import Head from 'next/head'
import { useState, useEffect} from 'react'
import Web3 from 'web3'
import vendingMachineContract from '../blokchain/vending'
import 'bulma/css/bulma.css'
import styles from '../styles/VendingMachine.module.css'



const VendingMachine = () => {
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [inventory, setInventory] = useState('')
    const [myDonutsCount, setmyDonutsCount] = useState('')
    const [buyCount, setBuyCount] = useState('')
    const [web3, setWeb3] = useState(null);
    const [address, setAddress] = useState(null)
    const [vmContract, setVmContract] = useState(null)

    useEffect(() => {
        if (vmContract) getInventoryHandler()
        if (vmContract && address) getMyDonutCountHandler()
    }, [vmContract, address])

    const getInventoryHandler = async () => {
        const inventory = await vmContract.methods.getVendingMachineBalance().call()
        setInventory(inventory)
    }

    const getMyDonutCountHandler = async () => {
        const count = await vmContract.methods.donutBalances(address).call()
        setmyDonutsCount(count)
    }

    const updateDonutQty = event => {
        setBuyCount(event.target.value)
    }

    const buyDonutHandler = async () => {
        try{
            await vmContract.methods.purchase(buyCount).send({
                from: address,
                value: web3.utils.toWei('2', 'ether') * buyCount
            })
            setSuccessMsg(`${buyCount} donuts purchased!`)
            if (vmContract) getInventoryHandler()
            if (vmContract && address) getMyDonutCountHandler()
        } catch(err) {
            setError(err.message)
        }
    }

    //window.ethereum
    const connectWalletHandler = async () => {
        /* ngecheck metamask wallet ada tau tidak */
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
            try{ 
                /* request connect wallet */
                await window.ethereum.request({ method: "eth_requestAccounts" })

                const web3 = new Web3(window.ethereum)
                setWeb3(web3)

                /* list akun */
                const accounts = await web3.eth.getAccounts()
                setAddress(accounts[0])

                /* local contract copy */
                const vm = vendingMachineContract(web3)
                setVmContract(vm)
            } catch(err) {
                setError(err.message)
            }
        } else {
            //metamask not installed
            console.log("Please install your Metamask")
        }
    }  

    return(
        <div className={styles.main}>
            <Head>
                <title>Vending Machine</title>
                <meta name="description" content="Blokchain Vending Machine app" />
            </Head>
            <nav className="navbar mt-4 mb-4">
                <div className="container">
                    <div className="navbar-brand">
                        <h1>Vending Machine</h1>
                    </div>
                    <div className="navbar-end">
                        <button onClick={connectWalletHandler} className="button is-primary">Connect Wallet</button>
                    </div>
                </div>
            </nav>
            <section>
                <div className="container">
                    <h2>VendingMachine Inventory: {inventory}</h2>
                </div>
            </section>
            <section>
                <div className="container">
                    <h2>My Donuts: {myDonutsCount}</h2>
                </div>
            </section>
            <section className="mt-5">
                <div className="container">
                    <div className="field">
                        <label className="label">Buy Donuts</label>
                        <div className="control">
                            <input onChange={updateDonutQty} className="input" type="type" placeholder="Enter amount..." />
                        </div>
                        <button 
                        onClick={buyDonutHandler} 
                        className="button is-primary mt-4">
                        Buy</button>
                    </div>
                </div>
            </section>
            <section>
                <div className="container has-text-danger">
                    <p>{error}</p>
                </div>
            </section>
            <section>
                <div className="container has-text-success">
                    <p>{successMsg}</p>
                </div>
            </section>
        </div>
    )
}


export default VendingMachine