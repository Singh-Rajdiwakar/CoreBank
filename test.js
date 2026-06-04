import axios from 'axios';
axios.post('http://localhost:5173/api/transfers/internal', {
  sourceAccountNumber: '123',
  destinationAccountNumber: '456',
  amount: 100,
  transferMode: 'INTERNAL',
  transactionPin: '123456'
}).catch(console.error)
