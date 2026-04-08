import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { cardAPI } from '../../../services/api';
import Toast from '../../../components/common/Toast';

const ToggleSwitch = ({ enabled, onChange, label, disabled }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-gray-700 font-medium">{label}</span>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const CardManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showHotlistModal, setShowHotlistModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { primaryAccount } = useStore();

  useEffect(() => {
    const fetchCards = async () => {
      if (!primaryAccount?.accountNumber) {
        setLoading(false);
        return;
      }
      try {
        const res = await cardAPI.getCards(primaryAccount.accountNumber);
        const data = res.data?.data || res.data || [];
        setCards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch cards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [primaryAccount]);

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleToggleSetting = async (settingKey, newValue) => {
    if (cards.length === 0) return;
    const currentCard = cards[activeCardIndex];
    if (currentCard.status === 'BLOCKED') {
      showNotification('Cannot modify settings for a blocked card.', 'error');
      return;
    }

    setIsUpdating(true);
    // Optimistic UI update
    const updatedCards = [...cards];
    updatedCards[activeCardIndex] = {
      ...currentCard,
      settings: { ...currentCard.settings, [settingKey]: newValue }
    };
    setCards(updatedCards);

    try {
      await cardAPI.updateSettings(currentCard.id, { [settingKey]: newValue });
      showNotification(`${settingKey.replace(/([A-Z])/g, ' $1').trim()} updated successfully.`);
    } catch (err) {
      console.error('Failed to update card settings:', err);
      // Revert optimistic update
      setCards(cards);
      showNotification('Failed to update settings. Try again.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBlockCard = async () => {
    if (cards.length === 0) return;
    const currentCard = cards[activeCardIndex];

    setIsUpdating(true);
    setShowBlockModal(false);

    try {
      await cardAPI.blockCard(currentCard.id);
      
      const updatedCards = [...cards];
      updatedCards[activeCardIndex] = { ...currentCard, status: 'BLOCKED' };
      setCards(updatedCards);
      
      showNotification('Card blocked successfully.', 'success');
    } catch (err) {
      console.error('Failed to block card:', err);
      showNotification('Failed to block card. Try again.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestCard = async () => {
    setIsUpdating(true);
    try {
      if (!primaryAccount) throw new Error("No primary account selected");
      const res = await cardAPI.requestCard({ accountId: primaryAccount.id, type: 'DEBIT' });
      setCards([...cards, res.data]);
      setActiveCardIndex(cards.length);
      showNotification('New card requested successfully.', 'success');
    } catch (err) {
      console.error('Failed to request card:', err);
      showNotification('Failed to request new card.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActivateCard = async () => {
    if (cards.length === 0) return;
    const currentCard = cards[activeCardIndex];
    setIsUpdating(true);
    try {
      await cardAPI.activateCard(currentCard.id);
      const updatedCards = [...cards];
      updatedCards[activeCardIndex] = { ...currentCard, status: 'ACTIVE' };
      setCards(updatedCards);
      showNotification('Card activated successfully.', 'success');
    } catch (err) {
      console.error('Failed to activate card:', err);
      showNotification('Failed to activate card.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnblockCard = async () => {
    if (cards.length === 0) return;
    const currentCard = cards[activeCardIndex];
    setIsUpdating(true);
    try {
      await cardAPI.unblockCard(currentCard.id);
      const updatedCards = [...cards];
      updatedCards[activeCardIndex] = { ...currentCard, status: 'ACTIVE' };
      setCards(updatedCards);
      showNotification('Card unblocked successfully.', 'success');
    } catch (err) {
      console.error('Failed to unblock card:', err);
      showNotification('Failed to unblock card.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleHotlistCard = async () => {
    if (cards.length === 0) return;
    const currentCard = cards[activeCardIndex];
    setIsUpdating(true);
    setShowHotlistModal(false);
    try {
      await cardAPI.hotlistCard(currentCard.id, { reason: 'Lost or Stolen' });
      const updatedCards = [...cards];
      updatedCards[activeCardIndex] = { ...currentCard, status: 'HOTLISTED' };
      setCards(updatedCards);
      showNotification('Card permanently hotlisted.', 'success');
    } catch (err) {
      console.error('Failed to hotlist card:', err);
      showNotification('Failed to hotlist card.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (cards.length === 0) return;
    const currentCard = cards[activeCardIndex];
    if (pinValue.length !== 4) {
      showNotification('PIN must be 4 digits', 'error');
      return;
    }
    setIsUpdating(true);
    setShowPinModal(false);
    try {
      await cardAPI.setPin(currentCard.id, { pin: pinValue });
      showNotification('Card PIN updated successfully.', 'success');
      setPinValue('');
    } catch (err) {
      console.error('Failed to set PIN:', err);
      showNotification('Failed to update PIN.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeCard = cards[activeCardIndex];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Card Display */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Cards</h2>

          {cards.length > 0 ? (
            <div className="relative perspective-1000">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard.id}
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                  className={`w-full max-w-sm aspect-[1.586/1] rounded-2xl p-6 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between ${
                    activeCard.status === 'BLOCKED'
                      ? 'bg-gradient-to-br from-gray-600 to-gray-900 grayscale'
                      : 'bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-600'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="text-xl tracking-wider font-semibold italic">NexPay</div>
                    <div>
                      {activeCard.type === 'CREDIT' ? (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">CREDIT</span>
                      ) : (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">DEBIT</span>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 flex-grow flex flex-col justify-center">
                    <div className="w-12 h-8 bg-yellow-400/80 rounded-md mb-4 flex items-center justify-between px-2">
                       <div className="w-1 h-6 border-l border-yellow-200"></div>
                       <div className="w-1 h-6 border-l border-yellow-200"></div>
                       <div className="w-1 h-6 border-l border-yellow-200"></div>
                    </div>
                    <div className="text-2xl tracking-[0.25em] font-mono text-gray-100">
                      **** **** **** {activeCard.cardNumber.slice(-4)}
                    </div>
                  </div>

                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <div className="text-xs text-blue-200 uppercase tracking-wider mb-1">Card Holder</div>
                      <div className="font-medium tracking-wider">{activeCard.cardHolderName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-blue-200 uppercase tracking-wider mb-1">Expires</div>
                      <div className="font-medium tracking-wider">{activeCard.expiryDate}</div>
                    </div>
                  </div>
                  
                  {activeCard.status === 'BLOCKED' && (
                    <div className="absolute inset-0 bg-red-900/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                      <div className="bg-red-600 text-white px-6 py-2 rounded-full font-bold transform -rotate-12 border-4 border-red-500 shadow-xl">
                        BLOCKED
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Card Navigation Dots */}
              {cards.length > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                  {cards.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveCardIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === activeCardIndex ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
             <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 space-y-4">
                <p>No active cards found for this account.</p>
                <button
                  onClick={handleRequestCard}
                  disabled={isUpdating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? 'Processing...' : 'Apply for New Card'}
                </button>
             </div>
          )}
        </div>

        {/* Right Column: Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Card Management</h3>
          
          {activeCard ? (
            <div className="space-y-6 flex-grow">
              {activeCard.status === 'INACTIVE' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center space-y-4">
                  <p className="text-yellow-800 font-medium">Your card is currently inactive.</p>
                  <p className="text-sm text-yellow-700">You must activate your card to use it for transactions.</p>
                  <button
                    onClick={handleActivateCard}
                    disabled={isUpdating}
                    className="px-6 py-2 bg-yellow-500 text-yellow-950 font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors w-full"
                  >
                    {isUpdating ? 'Activating...' : 'Activate Card'}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Usage Limits</h4>
                  <ToggleSwitch
                    label="Domestic Transactions"
                    enabled={activeCard.settings?.domesticEnabled ?? true}
                    disabled={isUpdating || activeCard.status === 'BLOCKED'}
                    onChange={(val) => handleToggleSetting('domesticEnabled', val)}
                  />
                  <ToggleSwitch
                    label="International Transactions"
                    enabled={activeCard.settings?.internationalEnabled ?? false}
                    disabled={isUpdating || activeCard.status === 'BLOCKED'}
                    onChange={(val) => handleToggleSetting('internationalEnabled', val)}
                  />
                  <ToggleSwitch
                    label="Contactless (NFC)"
                    enabled={activeCard.settings?.contactlessEnabled ?? true}
                    disabled={isUpdating || activeCard.status === 'BLOCKED'}
                    onChange={(val) => handleToggleSetting('contactlessEnabled', val)}
                  />
                  <ToggleSwitch
                    label="Online Transactions"
                    enabled={activeCard.settings?.onlineEnabled ?? true}
                    disabled={isUpdating || activeCard.status === 'BLOCKED'}
                    onChange={(val) => handleToggleSetting('onlineEnabled', val)}
                  />
                </div>
              )}

              <div className="pt-6 border-t border-gray-200 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Security Hub</h4>
                <button
                  onClick={() => setShowPinModal(true)}
                  disabled={isUpdating || activeCard.status === 'HOTLISTED'}
                  className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  Set / Change PIN
                </button>

                {activeCard.status === 'BLOCKED' ? (
                  <button
                    onClick={handleUnblockCard}
                    disabled={isUpdating}
                    className="w-full py-2.5 px-4 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 border border-green-200 disabled:opacity-50 transition-colors"
                  >
                    Unblock Card
                  </button>
                ) : (
                  <button
                    onClick={() => setShowBlockModal(true)}
                    disabled={activeCard.status === 'HOTLISTED' || activeCard.status === 'INACTIVE' || isUpdating}
                    className="w-full py-2.5 px-4 bg-orange-50 text-orange-600 font-medium rounded-lg hover:bg-orange-100 border border-orange-200 disabled:opacity-50 transition-colors"
                  >
                    Temporarily Block Card
                  </button>
                )}

                <button
                  onClick={() => setShowHotlistModal(true)}
                  disabled={activeCard.status === 'HOTLISTED' || isUpdating}
                  className="w-full py-2.5 px-4 mt-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Permanent Hotlist
                </button>
                <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
                  Hotlisting is irreversible and will permanently close this card.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 py-8">
              Select a card to view its settings.
            </div>
          )}
        </div>
      </div>

      {/* Block Confirmation Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Block this Card Temporarily?</h3>
              <p className="text-gray-500 text-center text-sm mb-6">
                Are you sure you want to block your card ending in {activeCard?.cardNumber.slice(-4)}? All transactions will be declined until you unblock it.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockCard}
                  className="flex-1 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Block
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hotlist Confirmation Modal */}
      <AnimatePresence>
        {showHotlistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-red-100"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-4 border border-red-200">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-red-700 mb-2">Permanent Hotlist Warning</h3>
              <div className="text-gray-600 text-center text-sm mb-6 space-y-3">
                <p>You are about to irreversibly HOTLIST your card ending in <strong>{activeCard?.cardNumber.slice(-4)}</strong>.</p>
                <p className="font-semibold text-red-600">This action cannot be undone.</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowHotlistModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleHotlistCard}
                  className="flex-1 py-2.5 bg-red-600 flex items-center justify-center text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hotlist Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Set PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2 mt-2">Set / Change PIN</h3>
              <p className="text-gray-500 text-center text-sm mb-6">
                Enter your new 4-digit numeric PIN for card ending in {activeCard?.cardNumber.slice(-4)}.
              </p>
              <form onSubmit={handleSetPin}>
                <input
                  type="password"
                  maxLength={4}
                  value={pinValue}
                  onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl tracking-widest py-3 mb-6 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••"
                  autoFocus
                />
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowPinModal(false); setPinValue(''); }}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || pinValue.length !== 4}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardManagement;