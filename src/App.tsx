import { Route, Routes } from "react-router-dom";
import { ScrollToTop, Shell } from "./components/Shell";
import { ChapterPage, ClassPage, HomePage, SearchPage, SimPage, SubjectPage } from "./pages";

export default function App() {
  return (
    <Shell>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/class/:classId" element={<ClassPage />} />
        <Route path="/class/:classId/:subject" element={<SubjectPage />} />
        <Route path="/class/:classId/:subject/:chapter" element={<ChapterPage />} />
        <Route path="/sim/:simId" element={<SimPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Shell>
  );
}
