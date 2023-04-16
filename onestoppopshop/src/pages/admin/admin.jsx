import React, { useContext, useEffect, useState } from 'react'
import styles from './admin.module.css'
import { get, ref } from 'firebase/database'
import { database } from '../../firebase'
import { ORDERS, USERS, CODES } from './spoof'
import { PRODUCTS } from '../../products'
import { AdminItem } from './adminItem'
import { Orderbox } from '../account/orderbox'
import { Userbox } from './userbox'
import { ShopContext } from '../../context/shop-context'

export const Admin = () => {
  const [users, setUsers] = useState({})
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState({})
  const { authUser } = useContext(ShopContext)

  const selectUser = (selUid) => {
    const updateSelected = {...selected}
    console.log(selUid)
    Object.keys(selected).forEach((uid) => {
        if (selUid === uid)
            updateSelected[uid] = !updateSelected[uid]
        else
            updateSelected[uid] = false
    })
    setSelected(updateSelected)
  }

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const ordersRef = ref(database, 'orders')
            const snapshot = await get(ordersRef)
            if (snapshot.exists()) {
                const data = snapshot.val()
                const orderNumbers = Object.keys(data)
                const finalOrders = Object.values(data)
                finalOrders.forEach((order, index) => {
                    order.key = orderNumbers[index]
                })
                // Remove empty items in finalOrders (possibly weird firebase thing)
                // Firebase makes the items into a list/array rather than a JSON object, this converts it back:
                // Note that this only happens for SOME items, some are read as JSONs as intended, and thus don't need conversion.
                finalOrders.forEach((order => {
                if (Array.isArray(order.items))
                {
                    const newItems = {}
                    order.items.forEach((item, index) => {
                        if (item) {
                        newItems[index] = item
                        }
                    })
                    order.items = newItems
                }
                }))
                setOrders(finalOrders)
            } else {
            return [] // Return an empty array if snapshot does not exist
            }
        } catch (error) {
            console.log(error)
            return [] // Return an empty array in case of an error
        }
    }

    const fetchUsers = async () => {
        try {
            const userRef = ref(database, 'users')
            get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    // Add selected to users:
                    const data = snapshot.val()
                    Object.keys(data).forEach((uid) => {
                        selected[uid] = false
                    })
                    setUsers(data)
                }
            })
        }
        catch (error) {
            console.log(error)
        }
    }
    fetchUsers()
    fetchOrders()
  }, [])

  return (
    <div className={styles.adminPage}>
        <div className={styles.top}>
            <div className={styles.users}>
                    {Object.keys(users).map((uid) => {
                        return <Userbox key={uid} uid={uid} data={users[uid]} selected={selected} selectUser={selectUser}/>
                    })}
            </div>

            <div className={styles.orders}>
                {orders.map((order) => <Orderbox key={order.key} data={order} />)}
            </div>
        </div>


        <div className={styles.items}>

        </div>

        <div className={styles.discountCodes}>

        </div>
    </div>
  )
}
