export interface PayFastPayment {
  amount: number
  itemName: string
  orderId: number
  customerEmail: string
  customerName: string
}

export const initiatePayFastPayment = (payment: PayFastPayment) => {
  const merchantId = import.meta.env.VITE_PAYFAST_MERCHANT_ID
  const merchantKey = import.meta.env.VITE_PAYFAST_MERCHANT_KEY
  const payFastUrl = import.meta.env.VITE_PAYFAST_URL

  const formData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${window.location.origin}/orders?payment=success&order_id=${payment.orderId}`,
    cancel_url: `${window.location.origin}/marketplace`,
    notify_url: `https://kinetique-vite-net-core.onrender.com/api/PayFast/notify`,
    name_first: payment.customerName.split(' ')[0],
    name_last: payment.customerName.split(' ')[1] || '',
    email_address: payment.customerEmail,
    m_payment_id: payment.orderId.toString(),
    amount: payment.amount.toFixed(2),
    item_name: payment.itemName,
  }

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = payFastUrl

  Object.entries(formData).forEach(([key, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}