
import React, { useState, useEffect, useRef } from 'react';
import { RESTAURANTS } from './data.ts';
import { Restaurant, MenuItem, ViewState, CartItem } from './types.ts';
import { getChefRecommendation } from './services/gemini.ts';

const MacroStat: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}></div>
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{label}</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  </div>
);

const GoalWidget: React.FC<{ currentKcal: number }> = ({ currentKcal }) => {
  const targetKcal = 1200;
  const percentage = Math.min((currentKcal / targetKcal) * 100, 100);
  
  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-zinc-500 text-sm font-medium">Your Daily Goal</h2>
        <button className="text-green-500 text-xs font-bold uppercase tracking-wider">Plan</button>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#27272a" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              fill="none" 
              stroke="#22c55e" 
              strokeWidth="3" 
              strokeDasharray={`${percentage}, 100`} 
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{currentKcal}</span>
            <span className="text-[10px] text-zinc-500 uppercase">Kcal</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-4">
          <MacroStat label="Protein" value="120g" color="text-green-500" />
          <MacroStat label="Carbs" value="150g" color="text-amber-500" />
          <MacroStat label="Fats" value="60g" color="text-blue-500" />
          <MacroStat label="Fiber" value="30g" color="text-purple-500" />
        </div>
      </div>
      <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const MenuItemRow: React.FC<{ item: MenuItem, onAdd: () => void }> = ({ item, onAdd }) => (
  <div className="relative group">
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1">
        <div className="mb-2">
          <span className="text-2xl font-bold text-green-500">{item.kcal} Kcal</span>
          <div className="flex gap-4 mt-1">
            <span className="text-xs text-zinc-400"><strong className="text-white">• {item.macros.protein}g</strong> P</span>
            <span className="text-xs text-zinc-400"><strong className="text-white">• {item.macros.carb}g</strong> C</span>
            <span className="text-xs text-zinc-400"><strong className="text-white">• {item.macros.fat}g</strong> F</span>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {item.tags?.map(tag => (
            <span key={tag} className="inline-block bg-[#1a1a1a] text-amber-500/80 text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-900/10">
              {tag}
            </span>
          ))}
        </div>
        <h4 className="text-lg font-medium text-zinc-200 mb-1">{item.name}</h4>
        <span className="text-zinc-500 font-bold">₹{item.price}</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-28 h-28">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-2xl shadow-xl" />
          {item.isBestSeller && (
            <div className="absolute -top-2 -right-2 flex gap-1">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-white shadow-lg">
                <i className="fas fa-award"></i>
              </div>
            </div>
          )}
        </div>
        <button onClick={onAdd} className="w-full bg-zinc-900 text-green-500 border border-zinc-800 px-6 py-2 rounded-xl font-bold hover:bg-zinc-800 transition-all active:scale-95">
          Add
        </button>
      </div>
    </div>
    <div className="mt-8 border-b border-zinc-800/30"></div>
  </div>
);

const RecommendationCard: React.FC<{ item: MenuItem, onAdd: () => void }> = ({ item, onAdd }) => (
  <div className="min-w-[280px] bg-[#18181b] border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
    <div className="flex justify-between items-start">
      <div>
        <span className="text-green-500 text-sm font-bold">{item.kcal} Kcal</span>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] text-zinc-400">• {item.macros.protein}g P</span>
        </div>
      </div>
      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
    </div>
    <div className="flex justify-between items-end">
      <div>
        <h4 className="text-sm font-medium text-zinc-200">{item.name}</h4>
        <span className="text-xs text-zinc-500 font-bold">₹{item.price}</span>
      </div>
      <button onClick={onAdd} className="bg-green-600/10 text-green-500 border border-green-500/30 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600/20">
        Add
      </button>
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState<'WELCOME' | 'HOME' | 'CART'>('WELCOME');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [sortOrder, setSortOrder] = useState<'low-to-high' | 'high-to-low'>('low-to-high');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const restaurant = RESTAURANTS[0];
  const categories = ['All', 'High Protein', 'Low Kcal', 'Vegan', 'Gluten Free'];

  const totalKcal = cart.reduce((sum, item) => sum + (item.menuItem.kcal * item.quantity), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      next[index].quantity = Math.max(0, next[index].quantity + delta);
      return next.filter(item => item.quantity > 0);
    });
  };

  const filteredMenu = restaurant.menu
    .filter(item => {
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const matchesVeg = !vegOnly || item.isVegetarian;
      return matchesCat && matchesVeg;
    })
    .sort((a, b) => sortOrder === 'low-to-high' ? a.price - b.price : b.price - a.price);

  const loadAIRecommendation = async () => {
    setLoadingRec(true);
    try {
      const rec = await getChefRecommendation(restaurant.menu);
      setRecommendation(rec);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRec(false);
    }
  };

  if (view === 'WELCOME') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-green-500/20">
          <i className="fas fa-leaf text-white text-4xl"></i>
        </div>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">{restaurant.name}</h1>
        <p className="text-zinc-500 mb-12 leading-relaxed">Experience mindful eating with our AI-powered healthy fusion menu.</p>
        <button 
          onClick={() => setView('HOME')}
          className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all shadow-xl"
        >
          View Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen relative bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
      
      {/* HOME VIEW */}
      <div className={`flex-1 transition-all duration-500 ease-in-out h-full overflow-y-auto custom-scrollbar ${view === 'HOME' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <header className="px-5 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-40">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{restaurant.name}</h1>
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <i className="fas fa-check text-[10px] text-white"></i>
            </div>
          </div>
          <button onClick={() => setView('WELCOME')} className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-zinc-400 text-sm"></i>
          </button>
        </header>

        <div className="px-5 py-2 flex items-center gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
            <input type="text" placeholder="Search menu..." className="w-full bg-[#18181b] border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-green-500" />
          </div>
          <div className="flex flex-col items-center">
            <button onClick={() => setVegOnly(!vegOnly)} className={`w-12 h-7 rounded-full p-1 transition-colors ${vegOnly ? 'bg-green-600' : 'bg-zinc-800'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${vegOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
            <span className="text-[10px] font-bold text-zinc-500 mt-1 uppercase">Veg Only</span>
          </div>
        </div>

        <section className="px-5 py-6">
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden min-h-[160px]">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-zinc-500 text-sm font-medium">Chef's Recommendation</h2>
              <i className="fas fa-magic text-green-500 animate-pulse"></i>
            </div>
            
            {!recommendation && !loadingRec && (
              <div onClick={loadAIRecommendation} className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer group transition-all">
                <p className="text-lg font-medium text-white mb-1">“What's best for me?”</p>
                <p className="text-green-500 font-bold underline decoration-2 underline-offset-4">Get AI Suggestion</p>
              </div>
            )}

            {loadingRec && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><i className="fas fa-circle-notch fa-spin text-green-500 text-2xl"></i></div>}
            
            {recommendation && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-lg font-bold text-white mb-2">{recommendation.specialName}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">{recommendation.specialDescription}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-500 font-bold">₹{recommendation.specialPrice}</span>
                  <button onClick={() => setRecommendation(null)} className="text-[10px] text-zinc-600 uppercase font-bold">Clear</button>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="flex overflow-x-auto px-5 gap-3 custom-scrollbar py-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-6 py-2.5 rounded-2xl border text-sm font-medium transition-all ${activeCategory === cat ? 'bg-green-600/10 border-green-500 text-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="px-5 pt-8 pb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">{activeCategory} Items</h3>
          <button onClick={() => setIsSortOpen(!isSortOpen)} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
            <i className="fas fa-sort-amount-down text-zinc-400"></i>
          </button>
        </div>

        <div className="px-5 space-y-8 mt-4 pb-40">
          {filteredMenu.map(item => <MenuItemRow key={item.id} item={item} onAdd={() => addToCart(item)} />)}
          {filteredMenu.length === 0 && <div className="py-20 text-center text-zinc-600">No items match your filters.</div>}
        </div>
      </div>

      {/* CART VIEW */}
      <div className={`fixed inset-0 z-50 bg-[#0a0a0a] transition-transform duration-500 ease-in-out flex flex-col ${view === 'CART' ? 'translate-y-0' : 'translate-y-full'}`}>
        <header className="px-5 pt-12 pb-6 flex items-center justify-between border-b border-zinc-900">
          <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-lg font-bold">Your Order</h1>
          <div className="w-10"></div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32 custom-scrollbar">
          <GoalWidget currentKcal={totalKcal} />

          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl overflow-hidden mb-8">
            <div className="p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">Your cart is empty.</div>
              ) : (
                cart.map((item, idx) => (
                  <div key={item.menuItem.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-zinc-100">{item.menuItem.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1">₹{item.menuItem.price} • {item.menuItem.kcal} kcal</p>
                    </div>
                    <div className="flex items-center gap-4 bg-zinc-900 rounded-xl px-4 py-2 border border-zinc-800">
                      <button onClick={() => updateQuantity(idx, -1)} className="text-green-500"><i className="fas fa-minus"></i></button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, 1)} className="text-green-500"><i className="fas fa-plus"></i></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">You might also like</h3>
            <div className="flex overflow-x-auto gap-4 custom-scrollbar pb-4">
              {restaurant.menu.slice(0, 3).map(item => (
                <RecommendationCard key={item.id} item={item} onAdd={() => addToCart(item)} />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#0a0a0a] border-t border-zinc-900 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <span className="text-zinc-500 font-medium">Total Bill</span>
            <span className="text-2xl font-bold">₹{totalPrice}</span>
          </div>
          <button className="w-full bg-green-500 text-black py-4 rounded-2xl font-bold text-xl active:scale-95 transition-transform">
            Place Order
          </button>
        </div>
      </div>

      {/* FIXED ACTION BAR */}
      {view === 'HOME' && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-black to-transparent">
          <div className="max-w-md mx-auto">
            <button 
              onClick={() => setView('CART')}
              className="w-full bg-[#18181b] border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-500 text-black w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Checkout</p>
                  <p className="font-bold text-white">₹{totalPrice}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-500 font-bold">
                View Summary
                <i className="fas fa-chevron-right text-xs"></i>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
