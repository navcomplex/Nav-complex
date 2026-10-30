 "use client";
import { useMemo, useState } from "react";
import { ShoppingBag, Search, Heart, Menu, X, MessageCircle, PackageCheck, Star, Gift, Bell, ShieldCheck } from "lucide-react";
import { starterProducts } from "@/lib/products";
import { supabase } from "@/lib/supabase";

type CartLine = { id:string; qty:number };
export default function Home() {
  const [cart,setCart] = useState<CartLine[]>([]);
  const [query,setQuery] = useState("");
  const [lang,setLang] = useState<"en"|"hi">("en");
  const [menu,setMenu] = useState(false);
  const [wishlist,setWishlist] = useState<string[]>([]);
  const [notice,setNotice] = useState("");
  const [checkout,setCheckout] = useState(false);
  const [customer,setCustomer] = useState({name:"",phone:"",address:"",pincode:""});
  const [payment,setPayment] = useState<"UPI"|"COD">("UPI");
  const [photo,setPhoto] = useState<File|null>(null);
  const [orderBusy,setOrderBusy] = useState(false);
  const products = starterProducts.filter(p => (p.name+" "+p.nameHi+" "+p.sku).toLowerCase().includes(query.toLowerCase()));
  const count = cart.reduce((n,x)=>n+x.qty,0);
  const total = useMemo(()=>cart.reduce((sum,line)=>sum+(starterProducts.find(p=>p.id===line.id)?.price||0)*line.qty,0),[cart]);
  const add = (id:string) => { setCart(old=>old.some(x=>x.id===id)?old.map(x=>x.id===id?{...x,qty:x.qty+1}:x):[...old,{id,qty:1}]); setNotice("Added to cart"); };
  const toggleWish = (id:string) => setWishlist(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
  async function placeOrder() {
    if (!customer.name || !/^[6-9]\d{9}$/.test(customer.phone) || !customer.address || !customer.pincode) { setNotice("Please complete name, 10-digit mobile, address and PIN code."); return; }
    if (!cart.length) return;
    setOrderBusy(true);
    const orderId = "NC"+Date.now().toString().slice(-9);
    const lines = cart.map(line=>({product:starterProducts.find(p=>p.id===line.id)!,qty:line.qty}));
    const upi = process.env.NEXT_PUBLIC_UPI_ID || "7255883384@ptyes";
    const upiLink = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent("NAV COMPLEX")}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent("Order "+orderId)}`;
    const payload = { order_id:orderId, customer_name:customer.name, phone:customer.phone, address:customer.address, pincode:customer.pincode, payment_method:payment, payment_status:payment==="COD"?"COD":"PENDING_ADMIN_VERIFICATION", subtotal:total, delivery_charge:null, total_amount:total, status:"ORDER_PLACED", items:lines.map(x=>({sku:x.product.sku,name:x.product.name,qty:x.qty,unit_price:x.product.price})) };
    if (supabase) {
      const { error } = await supabase.from("orders").insert(payload);
      if (error) { setNotice("Order save failed. Please configure Supabase and try again."); setOrderBusy(false); return; }
    } else {
      setNotice("Demo mode: configure Supabase to save orders permanently.");
    }
    setCart([]); setCheckout(false); setOrderBusy(false);
    if (payment==="UPI") window.location.href=upiLink;
    else setNotice(`Order ${orderId} placed. Cash on Delivery selected.`);
  }
  return <main>
    <div className="topline"><div className="wrap topflex"><span>Welcome to NAV COMPLEX · Quality you can trust</span><span>Customer Care: 7255883384</span></div></div>
    <header className="header"><div className="wrap nav">
      <button className="iconbtn mobile" onClick={()=>setMenu(!menu)} aria-label="Menu">{menu?<X/>:<Menu/>}</button>
      <a className="logo" href="#"><span className="mark">N</span><span>NAV <b>COMPLEX</b><small>YOUR SHOPPING DESTINATION</small></span></a>
      <div className="search"><Search size={18}/><input placeholder="Search products..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
      <div className="navactions"><button className="language" onClick={()=>setLang(lang==="en"?"hi":"en")}>{lang==="en"?"हिंदी":"English"}</button><button className="iconbtn" onClick={()=>setNotice(`Wishlist: ${wishlist.length} products`)} aria-label="Wishlist"><Heart/><small>{wishlist.length}</small></button><button className="cartbtn" onClick={()=>setCheckout(true)}><ShoppingBag size={18}/> Cart <b>{count}</b></button></div>
    </div>{menu&&<div className="mobilemenu wrap"><a href="#products">Shop</a><a href="#features">Features</a><a href="#contact">Contact</a></div>}</header>
    <section className="hero wrap"><div className="heroText"><div className="eyebrow">THE NAV COMPLEX COLLECTION</div><h1>{lang==="en"?"Make it personal.":"इसे अपना बनाइए।"}<br/><em>Make it special.</em></h1><p>{lang==="en"?"Personalized stickers, promotional posters and photo notebooks — made with care.":"पर्सनलाइज्ड स्टिकर, प्रचार पोस्टर और फोटो नोटबुक — आपके लिए खास।"}</p><a className="goldbtn" href="#products">Explore Collection <span>→</span></a><div className="heroTrust"><span><ShieldCheck size={16}/> Trusted shopping</span><span><PackageCheck size={16}/> Order updates</span></div></div><div className="heroBadge"><div className="orbit">NC</div><span>PERSONALIZED<br/>FOR YOU</span></div></section>
    <section className="wrap benefits"><div>✦ <span>Premium quality</span></div><div>↗ <span>UPI & Cash on Delivery</span></div><div>⌁ <span>Customer support</span></div><div>✧ <span>Made for you</span></div></section>
    <section className="wrap productsSection" id="products"><div className="sectionTitle"><div><div className="eyebrow dark">CURATED FOR YOU</div><h2>{lang==="en"?"Shop our products":"हमारे प्रोडक्ट खरीदें"}</h2><p>Thoughtful products. Personal touches.</p></div><span className="count">{products.length} PRODUCTS</span></div>
      <div className="productGrid">{products.map(p=><article className="product" key={p.id}><div className="productArt"><span className="sku">{p.sku}</span><button className={`wish ${wishlist.includes(p.id)?"active":""}`} onClick={()=>toggleWish(p.id)} aria-label="Add to wishlist"><Heart size={18}/></button><div className="emoji">{p.emoji}</div><div className="artCaption">NAV COMPLEX · CUSTOM MADE</div></div><div className="productInfo"><div className="productName">{lang==="en"?p.name:p.nameHi}</div><div className="pack">{p.pack}</div><div className="rating"><Star size={13} fill="currentColor"/> New arrival · {p.sku}</div><div className="priceRow"><strong>₹{p.price}</strong><button className="addBtn" disabled={!p.inStock} onClick={()=>add(p.id)}>{p.inStock?"ADD TO CART":"OUT OF STOCK"}</button></div><button className="reviewLink" onClick={()=>setNotice("Reviews and ratings will be enabled after customer accounts are configured.")}>☆ Write a review</button></div></article>)}</div>
    </section>
    <section className="wrap promo" id="features"><div><Gift/><h3>Rewards are on the way</h3><p>Coupons, referral rewards and exclusive offers for our customers.</p></div><div><Bell/><h3>Stay updated</h3><p>Get order updates and special announcements.</p></div><div><MessageCircle/><h3>Need help?</h3><p>Chat with our support team on WhatsApp.</p><a href="https://wa.me/917255883384" target="_blank">Chat on WhatsApp ↗</a></div></section>
    <footer id="contact"><div className="wrap footerGrid"><div><div className="logo footerLogo"><span className="mark">N</span><span>NAV <b>COMPLEX</b><small>YOUR SHOPPING DESTINATION</small></span></div><p>Personalized products, made with care.</p></div><div><b>CONTACT</b><p>7255883384</p><p>Middle School, Fatehpur, Tajpur,<br/>Samastipur, Bihar, India</p></div><div><b>PAYMENT</b><p>UPI · Cash on Delivery</p><p>UPI ID: 7255883384@ptyes</p></div></div><div className="copyright">© {new Date().getFullYear()} NAV COMPLEX. All rights reserved.</div></footer>
    {notice&&<div className="toast" onClick={()=>setNotice("")}>{notice} <button>×</button></div>}
    {checkout&&<div className="overlay" onClick={()=>setCheckout(false)}><div className="checkout" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setCheckout(false)}>×</button><div className="eyebrow dark">SECURE CHECKOUT</div><h2>Your order</h2>{cart.map(line=>{const p=starterProducts.find(x=>x.id===line.id)!;return <div className="checkoutLine" key={line.id}><span>{p.name} × {line.qty}</span><b>₹{p.price*line.qty}</b></div>})}<div className="checkoutTotal"><span>Subtotal (delivery set by admin)</span><b>₹{total}</b></div><div className="form"><label>Full name<input value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})}/></label><label>Mobile number<input maxLength={10} inputMode="numeric" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value.replace(/\D/g,"")})}/></label><label>Delivery address<textarea value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})}/></label><label>PIN code<input maxLength={6} value={customer.pincode} onChange={e=>setCustomer({...customer,pincode:e.target.value.replace(/\D/g,"")})}/></label><label>Payment method<select value={payment} onChange={e=>setPayment(e.target.value as "UPI"|"COD")}><option value="UPI">UPI App (Admin verification)</option><option value="COD">Cash on Delivery</option></select></label><button className="goldbtn full" disabled={orderBusy||!cart.length} onClick={placeOrder}>{orderBusy?"Placing...":`Place order · ₹${total}`}</button><small>Delivery charge will be confirmed by NAV COMPLEX admin. UPI payments remain pending until manually verified.</small></div></div></div>}
  </main>;
}
