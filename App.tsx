
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const GoalWidget: React.FC = () => (
  <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden mb-6">
    <div className="flex justify-between items-start mb-4">
      <h2 className="text-zinc-500 text-sm font-medium">Your Dinner Goal</h2>
      <button className="text-green-500 text-xs font-bold uppercase tracking-wider">Edit</button>
    </div>
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#27272a" strokeWidth="3" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="75, 100" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">622</span>
          <span className="text-[10px] text-zinc-500 uppercase">Kcal</span>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-4">
        <MacroStat label="Protein" value="25gm" color="text-green-500" />
        <MacroStat label="Carb" value="90gm" color="text-amber-500" />
        <MacroStat label="Fat" value="18gm" color="text-blue-500" />
        <MacroStat label="Fiber" value="18gm" color="text-purple-500" />
      </div>
    </div>
    <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
      <div className="h-full bg-green-500" style={{ width: '75%' }}></div>
    </div>
  </div>
);

const MenuItemRow: React.FC<{ item: MenuItem, onAdd: () => void }> = ({ item, onAdd }) => {
  return (
    <div className="relative">
      <div className="absolute -top-6 left-0">
        <i className="fas fa-shield-check text-green-500"></i>
      </div>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="mb-2">
            <span className="text-2xl font-bold text-green-500">{item.kcal} Kcal</span>
            <div className="flex gap-4 mt-1">
              <span className="text-xs text-zinc-400"><strong className="text-white">• {item.macros.protein}g</strong> Protein</span>
              <span className="text-xs text-zinc-400"><strong className="text-white">• {item.macros.carb}g</strong> Carb</span>
              <span className="text-xs text-zinc-400"><strong className="text-white">• {item.macros.fat}g</strong> Fat</span>
            </div>
          </div>
          <div className="mb-3">
            {item.tags?.map(tag => (
              <span key={tag} className="inline-block bg-[#1a1a1a] text-amber-500/80 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-amber-900/20">
                {tag}
              </span>
            ))}
          </div>
          <h4 className="text-lg font-medium text-zinc-200 mb-1">{item.name}</h4>
          <span className="text-zinc-500 font-bold">₹{item.price}</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-28 h-28">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
            {item.isBestSeller && (
              <div className="absolute -top-2 -right-2 flex gap-1">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-white">
                  <i className="fas fa-award"></i>
                </div>
                <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-[8px] text-white">
                  <i className="fas fa-fire"></i>
                </div>
                <div className="w-5 h-5 bg-white border border-green-500 rounded-sm flex items-center justify-center text-[10px]">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center">
            <button onClick={onAdd} className="w-full bg-[#18181b] text-green-500 border border-zinc-800 px-8 py-2.5 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
              Add
            </button>
            <span className="text-[10px] text-zinc-500 mt-2">Customisable</span>
          </div>
        </div>
      </div>
      <div className="mt-8 border-b border-zinc-800/30"></div>
    </div>
  );
};

const RecommendationCard: React.FC<{ item: MenuItem }> = ({ item }) => (
  <div className="min-w-[280px] bg-[#18181b] border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div>
        <span className="text-green-500 text-sm font-bold">{item.kcal} Kcal</span>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] text-zinc-400">• {item.macros.protein}g P</span>
          <span className="text-[10px] text-zinc-400">• {item.macros.carb}g C</span>
          <span className="text-[10px] text-zinc-400">• {item.macros.fat}g F</span>
        </div>
      </div>
      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
    </div>
    <div className="flex justify-between items-end">
      <div>
        <h4 className="text-sm font-medium text-zinc-200">{item.name}</h4>
        <span className="text-xs text-zinc-500 font-bold">₹{item.price}</span>
      </div>
      <button className="bg-[#1a3a2a] text-green-500 border border-green-500/30 px-4 py-1.5 rounded-lg text-xs font-bold">
        Add
      </button>
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [activeCategory, setActiveCategory] = useState('High Protein');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [sortOrder, setSortOrder] = useState<'low-to-high' | 'high-to-low'>('low-to-high');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const restaurant = RESTAURANTS[0];
  const categories = ['All', 'High Protein', 'Low Kcal', 'Gluten Free', 'Vegan'];

  // Mock initial items in cart
  useEffect(() => {
    if (cart.length === 0) {
      setCart([
        { menuItem: { ...restaurant.menu[0], name: 'Burger With Meat', price: 190 }, quantity: 1, variant: '(Half)' },
        { menuItem: { ...restaurant.menu[0], name: 'Burger With Meat', price: 160 }, quantity: 1 }
      ]);
    }
  }, []);

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
    setCart(prev => [...prev, { menuItem: item, quantity: 1 }]);
    setView(ViewState.CART);
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
    .sort((a, b) => {
      if (sortOrder === 'low-to-high') return a.price - b.price;
      return b.price - a.price;
    });

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

  const handleMenuClick = () => {
    if (view === ViewState.CART) {
      setView(ViewState.HOME);
    }
    setIsMenuDrawerOpen(true);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative bg-[#0a0a0a] text-white overflow-hidden">
      
      {/* HOME VIEW (MENU) */}
      <div className={`transition-all duration-500 ease-in-out h-full overflow-y-auto custom-scrollbar ${view === ViewState.HOME ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 pointer-events-none translate-y-10'}`}>
        <header className="px-5 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-40">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{restaurant.name}</h1>
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <i className="fas fa-check text-[10px] text-white"></i>
            </div>
          </div>
          <div className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center text-sm font-bold text-zinc-400">
            K
          </div>
        </header>

        <div className="px-5 py-2 flex items-center gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
            <input type="text" placeholder="Dish name..." className="w-full bg-[#18181b] border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-green-500 transition-colors" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-zinc-500">VEG</span>
            <button onClick={() => setVegOnly(!vegOnly)} className={`w-10 h-6 rounded-full p-1 transition-colors ${vegOnly ? 'bg-green-600' : 'bg-zinc-800'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${vegOnly ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        <section className="px-5 py-6">
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-zinc-500 text-sm font-medium">Your Dinner Goal</h2>
              <button className="text-green-500 text-xs font-bold uppercase tracking-wider">Edit</button>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#27272a" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="75, 100" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">622</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Kcal</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-4">
                <MacroStat label="Protein" value="25gm" color="text-green-500" />
                <MacroStat label="Carb" value="70gm" color="text-amber-500" />
                <MacroStat label="Fat" value="20gm" color="text-blue-500" />
                <MacroStat label="Fiber" value="18gm" color="text-purple-500" />
              </div>
            </div>
            <div onClick={loadAIRecommendation} className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer group transition-all">
              <p className="text-lg font-medium text-white mb-1">“See what’s best for you”</p>
              <p className="text-green-500 font-bold underline decoration-2 underline-offset-4 group-active:scale-95 transition-transform">Tap here</p>
            </div>
            {loadingRec && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-green-500 text-2xl"></i></div>}
            {recommendation && !loadingRec && (
              <div className="absolute inset-0 bg-[#18181b] p-6 flex flex-col animate-in fade-in duration-300">
                <button onClick={() => setRecommendation(null)} className="absolute top-4 right-4 text-zinc-500"><i className="fas fa-times"></i></button>
                <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">AI Recommendation</p>
                <h4 className="text-lg font-bold mb-2">{recommendation.specialName}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed overflow-hidden line-clamp-3">{recommendation.specialDescription}</p>
                <button className="mt-auto bg-green-600 text-white py-2 rounded-xl text-sm font-bold">Add to Goal - ₹{recommendation.specialPrice}</button>
              </div>
            )}
          </div>
        </section>

        <div className="flex overflow-x-auto px-5 gap-3 custom-scrollbar py-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${activeCategory === cat ? 'bg-[#1a3a2a] border-green-500 text-green-500' : 'bg-[#18181b] border-zinc-800 text-zinc-400'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="px-5 pt-8 pb-4 flex items-center justify-between relative">
          <div>
            <h3 className="text-xl font-bold">{activeCategory}</h3>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1"><i className="fas fa-info-circle"></i>Sorted by price {sortOrder.replace('-', ' ')}</div>
          </div>
          <div className="flex gap-4 text-zinc-400 items-center">
            <button onClick={() => setIsSortOpen(!isSortOpen)} className={`transition-colors ${isSortOpen ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}><i className="fas fa-arrow-down-wide-short"></i></button>
            {isSortOpen && (
              <div ref={sortRef} className="absolute right-5 top-full mt-2 w-48 bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl z-50 p-2">
                <div className="absolute -top-1 right-10 w-3 h-3 bg-[#18181b] border-t border-l border-zinc-800 rotate-45"></div>
                <div className="p-3">
                  <span className="text-sm font-bold text-white mb-4 block">Sort</span>
                  <div className="space-y-4">
                    <button onClick={() => { setSortOrder('low-to-high'); setIsSortOpen(false); }} className="flex items-center gap-3 w-full text-left group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${sortOrder === 'low-to-high' ? 'border-green-500' : 'border-zinc-700'}`}>{sortOrder === 'low-to-high' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}</div>
                      <span className={`text-sm font-medium ${sortOrder === 'low-to-high' ? 'text-white' : 'text-zinc-400'}`}>Low to High</span>
                    </button>
                    <button onClick={() => { setSortOrder('high-to-low'); setIsSortOpen(false); }} className="flex items-center gap-3 w-full text-left group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${sortOrder === 'high-to-low' ? 'border-green-500' : 'border-zinc-700'}`}>{sortOrder === 'high-to-low' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}</div>
                      <span className={`text-sm font-medium ${sortOrder === 'high-to-low' ? 'text-white' : 'text-zinc-400'}`}>High to Low</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 space-y-8 mt-4 pb-40">
          {filteredMenu.map(item => <MenuItemRow key={item.id} item={item} onAdd={() => addToCart(item)} />)}
        </div>
      </div>

      {/* CART VIEW (Slide-up transition) */}
      <div 
        className={`fixed inset-0 z-50 bg-[#0a0a0a] transition-transform duration-500 ease-in-out flex flex-col ${view === ViewState.CART ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <header className="px-5 pt-12 pb-6 flex items-center justify-between">
          <button onClick={() => setView(ViewState.HOME)} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
            <i className="fas fa-chevron-left"></i>
          </button>
          <h1 className="text-lg font-bold">Order Cart</h1>
          <div className="w-10 h-10"></div> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-32 custom-scrollbar">
          <GoalWidget />

          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-800/50">
              <h3 className="font-bold text-zinc-200">Your Order item ({cart.reduce((a, b) => a + b.quantity, 0)})</h3>
              <i className="fas fa-chevron-up text-zinc-500 text-sm"></i>
            </div>
            
            <div className="p-6 space-y-6">
              {cart.map((item, idx) => (
                <div key={`${item.menuItem.id}-${idx}`} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white border border-green-500 rounded-sm flex items-center justify-center text-[10px]">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <span className="font-medium text-zinc-200">{item.menuItem.name} <span className="text-zinc-500 text-sm">{item.variant}</span></span>
                    </div>
                    <div className="flex items-center gap-4 bg-[#0a0a0a] border border-green-500/30 rounded-lg px-3 py-1.5">
                      <button onClick={() => updateQuantity(idx, -1)} className="text-green-500 text-sm font-bold"><i className="fas fa-minus"></i></button>
                      <span className="text-sm font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, 1)} className="text-green-500 text-sm font-bold"><i className="fas fa-plus"></i></button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pl-6">
                    <button className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                      Edit <i className="fas fa-caret-right"></i>
                    </button>
                    <span className="text-sm font-bold text-zinc-300">₹{item.menuItem.price * item.quantity}</span>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setView(ViewState.HOME)}
                className="w-full flex items-center justify-end gap-2 text-green-500 text-sm font-bold mt-4"
              >
                +Add Item
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Recomended For You</h3>
            <div className="flex overflow-x-auto gap-4 custom-scrollbar pb-4 -mx-1 px-1">
              {restaurant.menu.map(item => (
                <RecommendationCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] to-transparent">
          <button className="w-full bg-[#22c55e] text-[#0a0a0a] py-4 rounded-2xl font-bold text-xl active:scale-95 transition-transform shadow-2xl shadow-green-500/20">
            Summery
          </button>
        </div>
      </div>

      {/* MENU DRAWER (DOWN TO UP ANIMATION) */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 flex items-end ${isMenuDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          onClick={() => setIsMenuDrawerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        ></div>
        <div 
          className={`w-full max-w-md mx-auto bg-[#18181b] rounded-t-[40px] p-8 pb-12 transition-transform duration-500 ease-out z-[101] ${isMenuDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-8"></div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Categories</h2>
            <button onClick={() => setIsMenuDrawerOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <div className="space-y-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setIsMenuDrawerOpen(false);
                  setView(ViewState.HOME);
                }}
                className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${
                  activeCategory === cat 
                    ? 'bg-[#1a3a2a] border-green-500/30 text-green-500' 
                    : 'bg-[#0a0a0a] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${activeCategory === cat ? 'bg-green-500' : 'bg-zinc-800'}`}></div>
                  <span className="font-bold text-lg">{cat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium opacity-50">
                    {cat === 'All' ? restaurant.menu.length : restaurant.menu.filter(i => i.category === cat).length} Items
                  </span>
                  <i className="fas fa-chevron-right text-xs opacity-30"></i>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-40 pointer-events-none">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          <button 
            onClick={handleMenuClick}
            className="bg-white text-zinc-900 px-8 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 pointer-events-auto active:scale-95 transition-all hover:bg-zinc-100 hover:shadow-white/10"
          >
            <i className="fas fa-utensils"></i>
            Menu
          </button>
          
          <div className={`w-full bg-[#18181b] rounded-2xl p-4 flex items-center justify-between shadow-2xl pointer-events-auto border border-zinc-800/50 transition-all duration-300 ${cart.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center gap-4">
              <span className="text-zinc-200 font-bold">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
              <div className="h-6 w-[1px] bg-zinc-700"></div>
              <span className="text-green-500 font-bold">₹{cart.reduce((a, b) => a + (b.menuItem.price * b.quantity), 0)}</span>
            </div>
            <button 
              onClick={() => setView(view === ViewState.CART ? ViewState.HOME : ViewState.CART)} 
              className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors active:scale-95 shadow-lg shadow-green-500/20"
            >
              {view === ViewState.CART ? 'Summery' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
