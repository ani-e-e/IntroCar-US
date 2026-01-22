import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for IntroCar USA. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-introcar-charcoal text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-light text-white">
            Privacy Policy
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6 text-lg">
              This Privacy Policy (the "Privacy Policy") applies between you, the User of this Website and IntroCar Ltd,
              the owner and provider of this Website. IntroCar Ltd takes the privacy of your information very seriously.
              This Privacy Policy applies to our use of any and all Data collected by us or provided by you in relation
              to your use of the Website. This Privacy Policy should be read alongside, and in addition to, our{' '}
              <a href="/terms" className="text-introcar-blue hover:underline">Terms and Conditions</a>.
            </p>
            <p className="text-gray-600 mb-8">Please read this Privacy Policy carefully.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Definitions and interpretation</h2>
            <p className="text-gray-600 mb-2">1. In this Privacy Policy, the following definitions are used:</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>"Data"</strong> collectively all information that you submit to IntroCar Ltd via the Website. This definition incorporates, where applicable, the definitions provided in the Data Protection Laws;</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>"Cookies"</strong> a small text file placed on your computer by this Website when you visit certain parts of the Website and/or when you use certain features of the Website. Details of the cookies used by this Website are set out in the clause below (Cookies);</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>"Data Protection Laws"</strong> any applicable law relating to the processing of personal Data, including but not limited to the GDPR, and any national implementing and supplementary laws, regulations and secondary legislation;</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>"GDPR"</strong> the UK General Data Protection Regulation;</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>"IntroCar Ltd", "We" or "Us"</strong> IntroCar Ltd, a company incorporated in England and Wales with registered number 02105867 whose registered office is at Units C & D The Pavilions, 2 East Road, London, SW19 1UW;</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>"UK and EU Cookie Law"</strong> the Privacy and Electronic Communications (EC Directive) Regulations 2003 as amended by the Privacy and Electronic Communications (EC Directive) (Amendment) Regulations 2011 & the Privacy and Electronic Communications (EC Directive) (Amendment) Regulations 2018;</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>"User" or "You"</strong> any third party that accesses the Website and is not either (i) employed by IntroCar Ltd and acting in the course of their employment or (ii) engaged as a consultant or otherwise providing services to IntroCar Ltd and accessing the Website in connection with the provision of such services; and</p>
            <p className="text-gray-600 mb-4 ml-4"><strong>"Website"</strong> the website that you are currently using, www.IntroCar.com, and any sub-domains of this site unless expressly excluded by their own terms and conditions.</p>

            <p className="text-gray-600 mb-2">2. In this Privacy Policy, unless the context requires a different interpretation:</p>
            <p className="text-gray-600 mb-2 ml-4">the singular includes the plural and vice versa;</p>
            <p className="text-gray-600 mb-2 ml-4">references to sub-clauses, clauses, schedules or appendices are to sub-clauses, clauses, schedules or appendices of this Privacy Policy;</p>
            <p className="text-gray-600 mb-2 ml-4">a reference to a person includes firms, companies, government entities, trusts and partnerships;</p>
            <p className="text-gray-600 mb-2 ml-4">"including" is understood to mean "including without limitation";</p>
            <p className="text-gray-600 mb-2 ml-4">reference to any statutory provision includes any modification or amendment of it;</p>
            <p className="text-gray-600 mb-6 ml-4">the headings and sub-headings do not form part of this Privacy Policy.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Scope of this Privacy Policy</h2>
            <p className="text-gray-600 mb-2">3. This Privacy Policy applies only to the actions of IntroCar Ltd and Users with respect to this Website. It does not extend to any websites that can be accessed from this Website including, but not limited to, any links we may provide to social media websites.</p>
            <p className="text-gray-600 mb-6">4. For purposes of the applicable Data Protection Laws, IntroCar Ltd is the "Data Controller". This means that IntroCar Ltd determines the purposes for which, and the manner in which, your Data is processed.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Data collected</h2>
            <p className="text-gray-600 mb-2">5. We may collect the following Data, which includes personal Data, from you:</p>
            <p className="text-gray-600 mb-2 ml-4">name;</p>
            <p className="text-gray-600 mb-2 ml-4">contact Information such as email addresses and telephone numbers;</p>
            <p className="text-gray-600 mb-2 ml-4">web browser type and version (automatically collected);</p>
            <p className="text-gray-600 mb-2 ml-4">operating system (automatically collected);</p>
            <p className="text-gray-600 mb-2 ml-4">a list of URLs starting with a referring site, your activity on this Website, and the site you exit to (automatically collected);</p>
            <p className="text-gray-600 mb-6 ml-4">in each case, in accordance with this Privacy Policy.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">How we collect Data</h2>
            <p className="text-gray-600 mb-2">6. We collect Data in the following ways:</p>
            <p className="text-gray-600 mb-2 ml-4">data is given to us by you; and</p>
            <p className="text-gray-600 mb-6 ml-4">data is collected automatically.</p>

            <h3 className="text-lg font-medium text-introcar-charcoal mb-4">Data that is given to us by you</h3>
            <p className="text-gray-600 mb-2">7. IntroCar Ltd will collect your Data in a number of ways, for example:</p>
            <p className="text-gray-600 mb-2 ml-4">when you contact us through the Website, by telephone, post, e-mail or through any other means;</p>
            <p className="text-gray-600 mb-2 ml-4">when you register with us and set up an account to receive our products/services;</p>
            <p className="text-gray-600 mb-2 ml-4">when you enter a competition or promotion through a social media channel;</p>
            <p className="text-gray-600 mb-2 ml-4">when you make payments to us, through this Website or otherwise;</p>
            <p className="text-gray-600 mb-2 ml-4">when you elect to receive marketing communications from us;</p>
            <p className="text-gray-600 mb-2 ml-4">when you use our services;</p>
            <p className="text-gray-600 mb-6 ml-4">in each case, in accordance with this Privacy Policy.</p>

            <h3 className="text-lg font-medium text-introcar-charcoal mb-4">Data that is collected automatically</h3>
            <p className="text-gray-600 mb-2">8. To the extent that you access the Website, we will collect your Data automatically, for example:</p>
            <p className="text-gray-600 mb-2 ml-4">we automatically collect some information about your visit to the Website. This information helps us to make improvements to Website content and navigation, and includes your IP address, the date, times and frequency with which you access the Website and the way you use and interact with its content.</p>
            <p className="text-gray-600 mb-6 ml-4">we will collect your Data automatically via cookies, in line with the cookie settings on your browser. For more information about cookies, and how we use them on the Website, see the section below, headed "Cookies".</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Our use of Data</h2>
            <p className="text-gray-600 mb-2">9. Any or all of the above Data may be required by us from time to time in order to provide you with the best possible service and experience when using our Website. Specifically, Data may be used by us for the following reasons:</p>
            <p className="text-gray-600 mb-2 ml-4">for order fulfillment;</p>
            <p className="text-gray-600 mb-2 ml-4">in each case, in accordance with this Privacy Policy.</p>
            <p className="text-gray-600 mb-2">10. We may use your Data for the above purposes if we deem it necessary to do so for our legitimate interests. If you are not satisfied with this, you have the right to object in certain circumstances (see the section headed "Your rights" below).</p>
            <p className="text-gray-600 mb-2">11. When you register with us and set up an account to receive our services, the legal basis for this processing is the performance of a contract between you and us and/or taking steps, at your request, to enter into such a contract.</p>
            <p className="text-gray-600 mb-6">12. We may use your Data to show you IntroCar Ltd adverts and other content on other websites. If you do not want us to use your data to show you IntroCar Ltd adverts and other content on other websites, please turn off the relevant cookies (please refer to the section headed "Cookies" below).</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Who we share Data with</h2>
            <p className="text-gray-600 mb-2">13. We may share your Data with the following groups of people for the following reasons:</p>
            <p className="text-gray-600 mb-2 ml-4">third party service providers who provide services to us which require the processing of personal data - for safe delivery of items;</p>
            <p className="text-gray-600 mb-2 ml-4">third party payment providers who process payments made over the Website - to enable third party payment providers to process user payments and refunds;</p>
            <p className="text-gray-600 mb-6 ml-4">in each case, in accordance with this Privacy Policy.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Keeping Data secure</h2>
            <p className="text-gray-600 mb-2">14. We will use technical and organisational measures to safeguard your Data, for example:</p>
            <p className="text-gray-600 mb-2 ml-4">access to your account is controlled by a password and a user name that is unique to you.</p>
            <p className="text-gray-600 mb-2 ml-4">we store your Data on secure servers.</p>
            <p className="text-gray-600 mb-2">15. We are certified to PCI DSS. This family of standards helps us manage your Data and keep it secure.</p>
            <p className="text-gray-600 mb-2">16. Technical and organisational measures include measures to deal with any suspected data breach. If you suspect any misuse or loss or unauthorised access to your Data, please let us know immediately by contacting us via this e-mail address: <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a>.</p>
            <p className="text-gray-600 mb-6">17. If you want detailed information from Get Safe Online on how to protect your information and your computers and devices against fraud, identity theft, viruses and many other online problems, please visit www.getsafeonline.org. Get Safe Online is supported by HM Government and leading businesses.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Data retention</h2>
            <p className="text-gray-600 mb-2">18. Unless a longer retention period is required or permitted by law, we will only hold your Data on our systems for the period necessary to fulfil the purposes outlined in this Privacy Policy or until you request that the Data be deleted.</p>
            <p className="text-gray-600 mb-6">19. Even if we delete your Data, it may persist on backup or archival media for legal, tax or regulatory purposes.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Your rights</h2>
            <p className="text-gray-600 mb-2">20. You have the following rights in relation to your Data:</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>Right to access</strong> - the right to request (i) copies of the information we hold about you at any time, or (ii) that we modify, update or delete such information. If we provide you with access to the information we hold about you, we will not charge you for this, unless your request is "manifestly unfounded or excessive." Where we are legally permitted to do so, we may refuse your request. If we refuse your request, we will tell you the reasons why.</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>Right to correct</strong> - the right to have your Data rectified if it is inaccurate or incomplete.</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>Right to erase</strong> - the right to request that we delete or remove your Data from our systems.</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>Right to restrict our use of your Data</strong> - the right to "block" us from using your Data or limit the way in which we can use it.</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>Right to data portability</strong> - the right to request that we move, copy or transfer your Data.</p>
            <p className="text-gray-600 mb-2 ml-4"><strong>Right to object</strong> - the right to object to our use of your Data including where we use it for our legitimate interests.</p>
            <p className="text-gray-600 mb-2">21. To make enquiries, exercise any of your rights set out above, or withdraw your consent to the processing of your Data (where consent is our legal basis for processing your Data), please contact us via this e-mail address: <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a>.</p>
            <p className="text-gray-600 mb-2">22. If you are not satisfied with the way a complaint you make in relation to your Data is handled by us, you may be able to refer your complaint to the relevant data protection authority. For the UK, this is the Information Commissioner's Office (ICO). The ICO's contact details can be found on their website at https://ico.org.uk/.</p>
            <p className="text-gray-600 mb-6">23. It is important that the Data we hold about you is accurate and current. Please keep us informed if your Data changes during the period for which we hold it.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Links to other websites</h2>
            <p className="text-gray-600 mb-6">24. This Website may, from time to time, provide links to other websites. We have no control over such websites and are not responsible for the content of these websites. This Privacy Policy does not extend to your use of such websites. You are advised to read the privacy policy or statement of other websites prior to using them.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Changes of business ownership and control</h2>
            <p className="text-gray-600 mb-2">25. IntroCar Ltd may, from time to time, expand or reduce our business and this may involve the sale and/or the transfer of control of all or part of IntroCar Ltd. Data provided by Users will, where it is relevant to any part of our business so transferred, be transferred along with that part and the new owner or newly controlling party will, under the terms of this Privacy Policy, be permitted to use the Data for the purposes for which it was originally supplied to us.</p>
            <p className="text-gray-600 mb-6">26. We may also disclose Data to a prospective purchaser of our business or any part of it.</p>
            <p className="text-gray-600 mb-6">27. In the above instances, we will take steps with the aim of ensuring your privacy is protected.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Cookies</h2>
            <p className="text-gray-600 mb-2">28. This Website may place and access certain Cookies on your computer. IntroCar Ltd uses Cookies to improve your experience of using the Website and to improve our range of products. IntroCar Ltd has carefully chosen these Cookies and has taken steps to ensure that your privacy is protected and respected at all times.</p>
            <p className="text-gray-600 mb-2">29. All Cookies used by this Website are used in accordance with current UK and EU Cookie Law.</p>
            <p className="text-gray-600 mb-2">30. Before the Website places Cookies on your computer, you will be presented with a message bar requesting your consent to set those Cookies. By giving your consent to the placing of Cookies, you are enabling IntroCar Ltd to provide a better experience and service to you. You may, if you wish, deny consent to the placing of Cookies; however certain features of the Website may not function fully or as intended.</p>
            <p className="text-gray-600 mb-4">31. This Website may place the following Cookies:</p>

            <div className="bg-introcar-light rounded-lg p-4 mb-6">
              <p className="text-gray-700 mb-2"><strong>Strictly necessary cookies</strong><br />These are cookies that are required for the operation of our website. They include, for example, cookies that enable you to log into secure areas of our website, use a shopping cart or make use of e-billing services.</p>
              <p className="text-gray-700 mb-2"><strong>Analytical/performance cookies</strong><br />They allow us to recognise and count the number of visitors and to see how visitors move around our website when they are using it. This helps us to improve the way our website works, for example, by ensuring that users are finding what they are looking for easily.</p>
              <p className="text-gray-700 mb-2"><strong>Functionality cookies</strong><br />These are used to recognise you when you return to our website. This enables us to personalise our content for you, greet you by name and remember your preferences (for example, your choice of language or region).</p>
              <p className="text-gray-700"><strong>Targeting cookies</strong><br />These cookies record your visit to our website, the pages you have visited and the links you have followed. We will use this information to make our website and the advertising displayed on it more relevant to your interests. We may also share this information with third parties for this purpose.</p>
            </div>

            <p className="text-gray-600 mb-2">32. You can find a list of Cookies that we use in the Cookies Schedule.</p>
            <p className="text-gray-600 mb-2">33. You can choose to enable or disable Cookies in your internet browser. By default, most internet browsers accept Cookies but this can be changed. For further details, please consult the help menu in your internet browser.</p>
            <p className="text-gray-600 mb-2">34. You can choose to delete Cookies at any time; however you may lose any information that enables you to access the Website more quickly and efficiently including, but not limited to, personalisation settings.</p>
            <p className="text-gray-600 mb-2">35. It is recommended that you ensure that your internet browser is up-to-date and that you consult the help and guidance provided by the developer of your internet browser if you are unsure about adjusting your privacy settings.</p>
            <p className="text-gray-600 mb-6">36. For more information generally on cookies, including how to disable them, please refer to aboutcookies.org. You will also find details on how to delete cookies from your computer.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">General</h2>
            <p className="text-gray-600 mb-2">37. You may not transfer any of your rights under this Privacy Policy to any other person. We may transfer our rights under this Privacy Policy where we reasonably believe your rights will not be affected.</p>
            <p className="text-gray-600 mb-2">38. If any court or competent authority finds that any provision of this Privacy Policy (or part of any provision) is invalid, illegal or unenforceable, that provision or part-provision will, to the extent required, be deemed to be deleted, and the validity and enforceability of the other provisions of this Privacy Policy will not be affected.</p>
            <p className="text-gray-600 mb-2">39. Unless otherwise agreed, no delay, act or omission by a party in exercising any right or remedy will be deemed a waiver of that, or any other, right or remedy.</p>
            <p className="text-gray-600 mb-6">40. This Agreement will be governed by and interpreted according to the law of England and Wales. All disputes arising under the Agreement will be subject to the exclusive jurisdiction of the English and Welsh courts.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Changes to this Privacy Policy</h2>
            <p className="text-gray-600 mb-6">41. IntroCar Ltd reserves the right to change this Privacy Policy as we may deem necessary from time to time or as may be required by law. Any changes will be immediately posted on the Website and you are deemed to have accepted the terms of the Privacy Policy on your first use of the Website following the alterations.</p>

            <div className="bg-introcar-light rounded-lg p-6 mb-6">
              <p className="text-gray-700">
                You may contact IntroCar Ltd by email at <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
