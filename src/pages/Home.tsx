import { useEffect } from "react";
import { SectionDots } from "@/components/Ui";
import {
  Arrivals,
  Bestsellers,
  Categories,
  Hero,
  Lookbook,
  Manifesto,
  Newsletter,
  Reviews,
  SaleBanner,
  Satisfaction,
  Social,
  Stats,
  Trust,
  Why,
} from "@/components/HomeSections";

const sections = [
  ["hero", "Intro"],
  ["manifesto", "Manifesto"],
  ["categories", "Categories"],
  ["arrivals", "New arrivals"],
  ["sale", "Sale"],
  ["why", "Why Shovid"],
  ["lookbook", "Lookbook"],
  ["best", "Bestsellers"],
  ["happy", "Satisfaction"],
  ["stats", "Numbers"],
  ["reviews", "Reviews"],
  ["social", "Community"],
  ["join", "Newsletter"],
] as const;

export default function Home() {
  useEffect(() => {
    document.documentElement.classList.add("snap");
    return () => document.documentElement.classList.remove("snap");
  }, []);

  return (
    <>
      <SectionDots sections={sections} />
      <Hero />
      <Trust />
      <Manifesto />
      <Categories />
      <Arrivals />
      <SaleBanner />
      <Why />
      <Lookbook />
      <Bestsellers />
      <Satisfaction />
      <Stats />
      <Reviews />
      <Social />
      <Newsletter />
    </>
  );
}
