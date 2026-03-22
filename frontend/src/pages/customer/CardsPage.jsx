import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Plus, CreditCard, Settings } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { cardAPI as cardsAPI } from '../../services/endpoints/cards'
import { toast } from 'sonner'
import { formatCurrency, maskCardNumber } from '../../utils/formatting'

export default function CardsPage() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [cardTransactions, setCardTransactions] = useState([])
  const [visibleCVV, setVisibleCVV] = useState({})
  const [requestLoading, setRequestLoading] = useState(false)

  const [requestData, setRequestData] = useState({
    cardType: 'DEBIT',
    accountNumber: '',
  })

  const [cardSettings, setCardSettings] = useState({
    domestic: true,
    international: true,
    contactless: true,
    ecommerce: true,
  })

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    setLoading(true)
    try {
      const response = await cardsAPI.getMyCards()
      setCards(response.data || [])
    } catch (error) {
      toast.error('Failed to load cards')
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async (cardNumber) => {
    try {
      const response = await cardsAPI.getCardTransactions(cardNumber)
      setCardTransactions(response.data || [])
      setShowTransactions(true)
    } catch (error) {
      toast.error('Failed to load transactions')
    }
  }

  const handleRequestCard = async (e) => {
    e.preventDefault()
    if (!requestData.cardType || !requestData.accountNumber) {
      toast.error('Please fill in all fields')
      return
    }

    setRequestLoading(true)
    try {
      await cardsAPI.requestCard(requestData)
      toast.success('Card request submitted successfully!')
      setShowRequestForm(false)
      setRequestData({ cardType: 'DEBIT', accountNumber: '' })
      loadCards()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request card')
    } finally {
      setRequestLoading(false)
    }
  }

  const handleCardAction = async (action, cardNumber) => {
    try {
      if (action === 'block') {
        await cardsAPI.blockCard(cardNumber)
        toast.success('Card blocked successfully')
      } else if (action === 'unblock') {
        await cardsAPI.unblockCard(cardNumber)
        toast.success('Card unblocked successfully')
      } else if (action === 'hotlist') {
        await cardsAPI.hotlistCard(cardNumber)
        toast.success('Card hotlisted')
      }
      loadCards()
    } catch (error) {
      toast.error('Action failed')
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      ACTIVE: { variant: 'success', label: '✓ Active' },
      BLOCKED: { variant: 'danger', label: '🔒 Blocked' },
      INACTIVE: { variant: 'warning', label: '⏸ Inactive' },
      HOTLISTED: { variant: 'danger', label: '❌ Hotlisted' },
    }
    return config[status] || { variant: 'secondary', label: status }
  }

  if (loading) {
    return <div className="text-white/60">Loading cards...</div>
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">My Cards</h1>
          <p className="text-white/60">Manage your debit and credit cards</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRequestForm(true)}
          className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Request Card
        </motion.button>
      </motion.div>

      {/* Cards Grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <CreditCard size={48} className="mx-auto mb-4 text-white/40" />
            <p className="text-white/60">No cards yet. Request one to get started!</p>
          </Card>
        ) : (
          cards.map((card, idx) => {
            const statusConfig = getStatusBadge(card.status)
            const isDetailVisible = visibleCVV[card.cardNumber]

            return (
              <motion.div
                key={card.cardNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                {/* Card Visual */}
                <motion.div
                  className="h-64 bg-gradient-to-br from-neon-blue/20 to-neon-cyan/10 rounded-xl p-6 border border-white/10 group-hover:border-neon-blue/50 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Background decorations */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-neon-blue/5 rounded-full blur-3xl -z-10" />
                  
                  <div>
                    <div className="flex justify-between items-start mb-12">
                      <span className="text-sm text-white/60 font-semibold">{card.cardType}</span>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/60 text-xs mb-2 tracking-widest">CARD NUMBER</p>
                    <p className="text-white text-2xl font-mono tracking-widest mb-6">
                      {maskCardNumber(card.cardNumber)}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-white/60 text-xs mb-1">CARDHOLDER</p>
                      <p className="text-white font-semibold">{card.cardholderName}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">EXPIRES</p>
                      <p className="text-white font-mono">{card.expiryMonth}/{card.expiryYear}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Card Details & Actions */}
                <Card className="mt-4">
                  <div className="space-y-4">
                    {/* Balance */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-white/60 text-xs mb-1">Available Balance</p>
                      <p className="text-xl font-bold gradient-text">
                        {formatCurrency(card.availableBalance || 0)}
                      </p>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Card Type</span>
                        <span className="text-white font-semibold">{card.cardType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Card Status</span>
                        <span className={`font-semibold ${card.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                          {card.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Issue Date</span>
                        <span className="text-white">{card.issueDate}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                      {card.status === 'ACTIVE' ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleCardAction('block', card.cardNumber)}
                          className="px-2 py-2 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-all"
                        >
                          Block
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleCardAction('unblock', card.cardNumber)}
                          className="px-2 py-2 text-xs bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg transition-all"
                        >
                          Unblock
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => loadTransactions(card.cardNumber)}
                        className="px-2 py-2 text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-all"
                      >
                        Transactions
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedCard(card)
                          setShowCardDetails(true)
                        }}
                        className="px-2 py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                      >
                        Settings
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Request Card Modal */}
      <Modal
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        title="Request a New Card"
        size="md"
      >
        <form onSubmit={handleRequestCard} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Card Type</label>
            <select
              value={requestData.cardType}
              onChange={(e) => setRequestData(prev => ({ ...prev, cardType: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="DEBIT">Debit Card</option>
              <option value="CREDIT">Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Account</label>
            <select
              value={requestData.accountNumber}
              onChange={(e) => setRequestData(prev => ({ ...prev, accountNumber: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="">Select account</option>
              {/* Accounts would be loaded from API */}
            </select>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowRequestForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={requestLoading}
              disabled={requestLoading}
            >
              Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Card Transactions Modal */}
      <Modal
        isOpen={showTransactions}
        onClose={() => setShowTransactions(false)}
        title={`Transactions - ${selectedCard?.cardNumber?.slice(-4)}`}
        size="lg"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {cardTransactions.length === 0 ? (
            <p className="text-white/60 text-center py-4">No transactions</p>
          ) : (
            cardTransactions.map((txn, idx) => (
              <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between mb-1">
                  <span className="text-white font-semibold text-sm">{txn.merchant}</span>
                  <span className="text-red-400 font-semibold">-{formatCurrency(txn.amount)}</span>
                </div>
                <div className="flex justify-between text-white/60 text-xs">
                  <span>{txn.date}</span>
                  <span className={`font-semibold ${txn.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Card Settings Modal */}
      <Modal
        isOpen={showCardDetails}
        onClose={() => setShowCardDetails(false)}
        title="Card Settings"
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {Object.entries(cardSettings).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setCardSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded accent-neon-blue"
                />
                <span className="text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>

          <Button className="w-full">Save Settings</Button>
        </div>
      </Modal>
    </div>
  )
}
