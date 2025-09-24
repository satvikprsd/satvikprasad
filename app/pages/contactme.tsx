export default function ContactMe() {
    return (
        <a href="mailto:satvikprsd@gmail.com" className="contactme">
            <div className="box contactme-content boxanimation flex flex-col space-y-2 justify-between">
                <div className="contactme-stext mb-4">Have any questions?</div>
                <div className="loader"></div>
                <p className="contactme-text">Contact Me</p>
            </div>
        </a>
    );
}
