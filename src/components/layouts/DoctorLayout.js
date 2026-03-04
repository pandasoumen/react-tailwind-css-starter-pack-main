import Navbar from '../Navbar';
import Footer from '../Footer';

export default function DoctorLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar role="doctor" />
      <main className="flex-1 bg-slate-900 p-6">{children}</main>
      <Footer />
    </div>
  );
}