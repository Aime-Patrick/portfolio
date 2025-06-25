import React from "react";
import ProjectCard from "../components/ProjectCard";

// Example project data; replace with your real data or props
const projects = [
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
	// Add more projects as needed
];

const ProjectsSection: React.FC = () => (
	<section className="projects__content section" id="project">
		<h2 className="section__title-1">
			<span>Projects.</span>
		</h2>
		<div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 container place-items-center">
			{projects.map((project, idx) => (
				<ProjectCard key={idx} {...project} />
			))}
		</div>
	</section>
);

export default ProjectsSection;
