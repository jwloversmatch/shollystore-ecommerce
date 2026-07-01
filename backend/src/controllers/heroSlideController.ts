import { Request, Response } from 'express';
import { HeroSlide } from '../models/HeroSlide';

// Public: get active slides sorted by order
export const getHeroSlides = async (req: Request, res: Response): Promise<void> => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });
    res.json(slides);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all slides
export const getAllHeroSlides = async (req: Request, res: Response): Promise<void> => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json(slides);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: create slide
export const createHeroSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl, title, subtitle, order, isActive } = req.body;
    const slide = new HeroSlide({ imageUrl, title, subtitle, order, isActive });
    await slide.save();
    res.status(201).json(slide);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: update slide
export const updateHeroSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const slide = await HeroSlide.findByIdAndUpdate(id, req.body, { new: true });
    if (!slide) {
      res.status(404).json({ message: 'Slide not found' });
      return;
    }
    res.json(slide);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: delete slide
export const deleteHeroSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const slide = await HeroSlide.findByIdAndDelete(id);
    if (!slide) {
      res.status(404).json({ message: 'Slide not found' });
      return;
    }
    res.json({ message: 'Slide deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};