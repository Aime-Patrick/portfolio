import React, { useState, useEffect } from "react";
import ProjectCard from "../components/ProjectCard";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';



const ProjectsSection: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsCollection = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsCollection);
        const projectsList = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectsList);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Fallback to default projects
        setProjects([
			{
				image: "project-1.png",
				subtitle: "Web App",
				title: "E-commerce Ninjas Store",
				description:
					"E-commerce Ninjas is a dynamic and scalable online shopping platform developed as part of a collaborative project with Andela. The platform aims to provide a seamless shopping experience, catering to various user roles, including Admin, Merchant, and Customer. The project focused on delivering an intuitive user interface, secure transactions, and robust role-based access control (RBAC) to manage different functionalities based on user roles.",
				links: [
					{
						url: "https://github.com/AimePazzo/e-commerce-ninjas",
						label: "GitHub",
					},
					{
						url: "https://e-commerce-ninjas.netlify.app/",
						label: "Live",
					},
				],
			},
			{
				image: "project-4.jpg",
				subtitle: "Web App",
				title: "Made in Rwanda Website",
				description:
					" Project that you carry out in the design and structure of the layout, showing the design at the client's request.",
				links: [
					{
						url: "https://github.com/AimePazzo/mirwanda-website",
						label: "GitHub",
					},
					{
						url: "https://mirwanda-website.vercel.app/",
						label: "Live",
					},
				],
			},
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);
  
  return (
	<section className="projects section" id="project" aria-label="Projects section">
		<div className="projects__container container">
		<h2 className="section__title-1">
			<span>Projects</span>
		</h2>
		{loading ? (
			<div className="container text-center py-8">
				<p>Loading projects...</p>
			</div>
		) : (
			<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 container place-items-center"
			style={projects.length === 1 ? { gridTemplateColumns: '1fr', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' } : undefined}
			>
				{projects.map((project, idx) => (
					<ProjectCard key={idx} {...project} />
				))}
			</div>
		)}
		</div>
	</section>
  );
};

export default ProjectsSection;
