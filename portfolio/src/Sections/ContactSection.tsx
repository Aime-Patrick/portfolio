import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import SocialLinks from "../components/socialLinks";
import toast from 'react-hot-toast'
import { RiSendPlaneFill } from "react-icons/ri";
const ContactSection: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;

    emailjs
      .sendForm(
        "service_kzutdjf",
        "template_h8w87eq",
        form.current,
        "mbdQfTjlWxjvdh2ij"
      )
      .then(
        () => {
          toast.success("Message sent successfully");
          form.current?.reset();
        },
        () => {
          toast.error("Message not sent (service error)");
          form.current?.reset();
        }
      );
  };

  return (
    <section className="contact section" id="contact">
      <div className="contact__container grid">
        <div className="contact__data">
          <h2 className="section__title-2">
            <span>Contact Me.</span>
          </h2>
          <p className="contact__description-1">
            I will read all emails. Send me any message you want and I'll get back to you
          </p>
          <p className="contact__description-2">
            I need your <b>Name</b> and <b>Email Address</b>, but you won't receive anything other than your reply.
          </p>
          <div className="geomatric-box"></div>
        </div>
        <div className="contact__mail">
          <h2 className="contact__title">Send Me A Message</h2>
          <form className="contact__form" id="contact-form" ref={form} onSubmit={sendEmail}>
            <div className="contact__group">
              <div className="contact__box">
                <input
                  type="text"
                  name="user_name"
                  className="contact__input"
                  id="name"
                  required
                  placeholder="Enter Name"
                />
                <label htmlFor="name" className="contact__label">
                  Name
                </label>
              </div>
              <div className="contact__box">
                <input
                  type="email"
                  name="user_email"
                  className="contact__input"
                  id="email"
                  required
                  placeholder="Email Address"
                />
                <label htmlFor="email" className="contact__label">
                  Email address
                </label>
              </div>
            </div>
            <div className="contact__box">
              <input
                type="text"
                name="user_subject"
                className="contact__input"
                id="subject"
                required
                placeholder="Subject"
              />
              <label htmlFor="subject" className="contact__label">
                Subject
              </label>
            </div>
            <div className="contact__box contact__area">
              <textarea
                name="user_message"
                id="message"
                className="contact__input"
                required
                placeholder="Message"
              ></textarea>
              <label htmlFor="message" className="contact__label">
                Message
              </label>
            </div>
            <button className="contact__button button" type="submit">
              < RiSendPlaneFill className="svg"/> Send Message
            </button>
          </form>
        </div>
        <div className="contact__social">
          <img
            src="curved-arrow.svg"
            alt=""
            className="contact__social-arrow"
          />
          <div className="contact__social-data">
            <div>
              <p className="contact__social-description-1">
                Write me on my social networks
              </p>
            </div>
            <div className="flex gap-4 items-center justify-center">
                <SocialLinks variant="contact" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;