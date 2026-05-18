import React from 'react';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Breadcrumbs from '../components/Breadcrumbs';

const ExperienceView: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Breadcrumbs 
        title="Experience" 
        subtitle="Professional Journey" 
        image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
      />
      
      <Experience />
      
      <div className="border-t border-white/5">
        <Skills />
      </div>
    </div>
  );
};

export default ExperienceView;