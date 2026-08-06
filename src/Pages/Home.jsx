import Header from "../components/Header";
import About from "../components/About";
import Skills from "../components/Skills";
import Footer from "../components/Footer";

const skillList = [
  "React",
  "JavaScript",
  "CSS",
  "Responsive design",
  "Vite",
];

function Home() {
  return (
    <>
      

      <main className="page-section kinetic-main">
        <Header name="Raj Bhut" />
        <About />
        <Skills skillList={skillList} />
        <Footer />
      </main>
    </>
  );
}

export default Home;
