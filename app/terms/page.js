import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for IntroCar USA. Read our terms of service and purchase conditions.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-introcar-charcoal text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-light text-white">
            Terms & Conditions
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-gray max-w-none">

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">1. Application</h2>
            <p className="text-gray-600 mb-2">1.1 These are the only Terms and Conditions on which We supply Goods and/or Services to You.</p>
            <p className="text-gray-600 mb-2">1.2 If You order any Goods and/or Services from Us you agree to be bound by these Terms and Conditions. You may only purchase the Goods and/or Services if you are legally eligible to enter into a contract and are at least 18 years old.</p>
            <p className="text-gray-600 mb-6">1.3 We reserve the right to vary these Terms and Conditions on giving not less than 30 days prior written notice.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">2. Definitions</h2>
            <p className="text-gray-600 mb-2">The following terms will have the following meaning when used in these Terms and Conditions:</p>
            <p className="text-gray-600 mb-2">2.1 "Consumer" means an individual acting for purposes which are wholly or mainly outside their trade, business, craft or profession;</p>
            <p className="text-gray-600 mb-2">2.2 "Contract" means the legally-binding agreement between You and Us for the supply of Goods and/or Services;</p>
            <p className="text-gray-600 mb-2">2.3 "Delivery Location" means IntroCar's premises or other location where the Goods and/or Services are to be supplied, as set out in the Order;</p>
            <p className="text-gray-600 mb-2">2.4 "Goods" means the goods We supply to You of the number and description as set out in the Order;</p>
            <p className="text-gray-600 mb-2">2.5 "IntroCar" means IntroCar Limited (Company Number 02105867) whose registered office is at Units C & D The Pavilions, 2 East Road, London, SW19 1UW, with email address sales@introcar.com and telephone number +44 (0) 20 8546 2027;</p>
            <p className="text-gray-600 mb-2">2.6 "Services" means any services We provide to You and as described in the Order;</p>
            <p className="text-gray-600 mb-2">2.7 "Order" means the Customer's order for the Goods and/or Services from IntroCar;</p>
            <p className="text-gray-600 mb-2">2.8 "Privacy Policy" means the terms which set out how we will deal with confidential and personal information received from you via the Website;</p>
            <p className="text-gray-600 mb-2">2.9 "Us" or "We" means IntroCar; and</p>
            <p className="text-gray-600 mb-2">2.10 "Website" means www.introcar.com</p>
            <p className="text-gray-600 mb-6">2.11 "You" or "Your" means IntroCar's customer being the individual or company to whom the Goods and/or Services are supplied.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">3. Goods</h2>
            <p className="text-gray-600 mb-2">3.1 The description and/or images of the Goods on Our Website and in Our catalogues, brochures or other form of advertisement are illustrative only. The actual Goods supplied may vary from those descriptions and/or images.</p>
            <p className="text-gray-600 mb-2">3.2 In the case of any Goods made to Your special requirements, it is Your responsibility to ensure that any information or specification You provide is accurate.</p>
            <p className="text-gray-600 mb-2">3.3 All Goods which appear on the Website are subject to availability.</p>
            <p className="text-gray-600 mb-6">3.4 We can make changes to the Goods which are necessary to comply with any applicable law or safety requirement or to implement technical adjustments and improvements which do not materially change the main characteristics of the Goods. We will notify you of these changes.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">4. Personal information</h2>
            <p className="text-gray-600 mb-2">4.1 We collect and use personal information in accordance with the Privacy Policy.</p>
            <p className="text-gray-600 mb-6">4.2 We may contact You by using e-mail or other electronic communication methods and by pre-paid post to inform You of changes to our Website, events and offers and You expressly agree to this. We shall not pass Your information to third party organisations. Your subscription preferences can be updated at any time.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">5. Basis of Sale</h2>
            <p className="text-gray-600 mb-2">5.1 The description of the Goods and/or Services on the Website and in our catalogues, brochures or other form of advertisement does not constitute a contractual offer to sell the Goods and/or Services. When an Order has been submitted by You, We can reject it for any reason, although We will try to tell You the reason without delay. Reasons include but are not limited to: Goods being out of stock, unexpected resource limitations, identification of an error in the price or description of a product or because We are unable to meet a delivery deadline You have specified.</p>
            <p className="text-gray-600 mb-2">5.2 The Order process is set out on the Website. Each step allows You to check and amend any errors before submitting the Order. It is Your responsibility to check that You have used the ordering process correctly.</p>
            <p className="text-gray-600 mb-2">5.3 A Contract will be formed for the sale of Goods and/or Services ordered only when You receive an email from Us confirming the Order (the "Order Confirmation"). You must ensure that the Order Confirmation is complete and accurate and inform Us immediately of any errors. We are not responsible for any inaccuracies in the Order placed by You. By placing an Order, You agree to Us giving You confirmation of the Contract by means of an email with all information in it. You will receive the Order Confirmation within a reasonable time after making the Contract, but in any event not later than the delivery of any Goods supplied under the Contract.</p>
            <p className="text-gray-600 mb-2">5.4 Any quotation is valid for a maximum period of 14 days from its date unless We expressly withdraw it at an earlier time.</p>
            <p className="text-gray-600 mb-6">5.5 No variation of the Contract, whether about description of the Goods, fees or otherwise, can be made after it has been entered into unless the variation is agreed by Us in writing.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">6. Price and Payment</h2>
            <p className="text-gray-600 mb-2">6.1 The price of the Goods and/or Services and any additional delivery or other charges is that set out on the Website at the date of the Order or such other price as we may agree in writing.</p>
            <p className="text-gray-600 mb-2">6.2 The price of the Goods and/or Services (which, unless otherwise stated, excludes VAT) will be the price quoted to You or stated on the Website.</p>
            <p className="text-gray-600 mb-2">6.3 It is possible Goods and/or Services we sell may be incorrectly priced. We typically check prices before accepting Your Order so that, where the correct price of the Goods and/or Services at Your Order date is less than Our stated price at Your Order date, We will charge the lower amount. If the Goods' or Services' correct price at Your Order date is higher than the price stated to You, We will contact You for Your instructions before We accept Your order. If We accept and process Your Order where a pricing error is obvious and unmistakable and could reasonably have been recognized by You as a mistake, We may end the Contract, refund You any sums You have paid and require the return of any Goods provided to You.</p>
            <p className="text-gray-600 mb-2">6.4 We accept payment by all major debit and credit cards (including Visa, Mastercard and American Express), Amazon Pay and PayPal. Unless We agree credit terms with You in writing, You must pay for the Goods and/or Services before We dispatch them to You.</p>
            <p className="text-gray-600 mb-2">6.5 If We offer You credit terms at Our sole discretion, You shall pay each invoice submitted by Us:</p>
            <p className="text-gray-600 mb-2 ml-4">6.5.1 30 days end of month;</p>
            <p className="text-gray-600 mb-2 ml-4">6.5.2 in full and in cleared funds to a bank account nominated in writing by Us, and time for payment shall be of the essence of the contract; and</p>
            <p className="text-gray-600 mb-2 ml-4">6.5.3 if You do not make any payment to Us by the due date We may charge interest to You on the overdue amount. This interest shall accrue on a daily basis from the due date until the date of actual payment of the overdue amount, whether before or after judgment. You must pay Us interest together with any overdue amount.</p>
            <p className="text-gray-600 mb-2">6.6 If You believe there to be an error in an invoice please contact Us promptly to advise Us. You will not have to pay any interest until the dispute is resolved. Once the dispute is resolved We will, if applicable, charge You interest on correctly invoiced sums from the original due date.</p>
            <p className="text-gray-600 mb-6">6.7 Please be aware that import duties and taxes may apply in countries outside of the United Kingdom. All duties and taxes are set by the Customs Authority of the destination country. Please note that it will be the responsibility of the customer to communicate promptly with the importing agent and pay all import duties and taxes immediately on request. Failure to do so may result in delay and/or return of the goods.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">7. Surcharges</h2>
            <p className="text-gray-600 mb-2">7.1 Where We supply You with Goods with an exchange-part surcharge applied, we will refund the surcharge amount to You provided that We receive from you within 28 days of the date of delivery of the relevant Goods a corresponding like-for-like part ("Exchange Part") in a reasonable and serviceable condition and in accordance with our requirements including any relevant surcharge policy made known to You ("Surcharge Conditions").</p>
            <p className="text-gray-600 mb-2">7.2 We calculate Our exchange-part surcharges on the basis that We will receive an Exchange Part from You which fulfils Our Surcharge Conditions. Accordingly, if in Our sole discretion and acting reasonably, We determine that the Exchange Part provided by You does not meet Our Surcharge Conditions then We may not refund the surcharge or may reduce it accordingly in which case We will notify You and You will have the opportunity to collect or arrange collection of the Exchange Part You provided to Us.</p>
            <p className="text-gray-600 mb-6">7.3 Any surcharge due to You will be refunded within 30 days of Us receiving the corresponding part from You and made by the same method You used to pay.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">8. Delivery</h2>
            <p className="text-gray-600 mb-2">8.1 The costs of delivery will be as advised to You before You place Your Order.</p>
            <p className="text-gray-600 mb-2">8.2 We will deliver the Goods, to the Delivery Location by the time or within the agreed period or, failing any agreement, without undue delay and, in any event, not more than 30 days after the day on which the Contract is entered into.</p>
            <p className="text-gray-600 mb-2">8.3 In any case, regardless of events beyond our control, if We do not deliver the Goods on time, You can (in addition to any other remedies) treat the Contract at an end if:</p>
            <p className="text-gray-600 mb-2 ml-4">8.3.1 We have refused to deliver the Goods, or if delivery on time is essential taking into account all the relevant circumstances at the time the Contract was made, or You said to Us before the Contract was made that delivery on time was essential; or</p>
            <p className="text-gray-600 mb-2 ml-4">8.3.2 after We have failed to deliver on time, You have specified a later period which is appropriate to the circumstances and We have not delivered within that period.</p>
            <p className="text-gray-600 mb-2">8.4 If You treat the Contract at an end, We will return all payments made under the Contract.</p>
            <p className="text-gray-600 mb-2">8.5 If You are entitled to treat the Contract at an end, but do not do so, You are not prevented from cancelling the Order for any Goods or rejecting Goods that have been delivered and, if you do this, We will return all payments made under the Contract for any such cancelled or rejected Goods. If the Goods have been delivered, You must return them to Us or allow Us to collect them from You and We will pay the costs of this.</p>
            <p className="text-gray-600 mb-2">8.6 If You have requested to collect the Goods from Our premises ("Customer Collection"), You can collect them from Us at any time during Our working hours after We have notified You that the Goods are ready for collection.</p>
            <p className="text-gray-600 mb-2">8.7 If no one is available at Your address to take delivery and the Goods cannot be posted through Your letterbox, the relevant courier will leave You a note informing You of how to rearrange delivery or collect the Goods.</p>
            <p className="text-gray-600 mb-2">8.8 If You do not collect the Goods from Us as arranged or if, after a failed delivery to You, You do not re-arrange delivery or collect them from the relevant courier and the Goods are returned to Us, We will contact You for further instructions and may charge you for storage costs and any further delivery costs. If despite Our efforts We are unable to contact You or re-arrange delivery or collection then We may end the Contract and charge You reasonable compensation for Our costs and/or losses.</p>
            <p className="text-gray-600 mb-2">8.9 You agree We may deliver the Goods in instalments if We suffer a shortage of stock or other genuine and fair reason, subject to the above provisions and provided You are not liable for extra charges.</p>
            <p className="text-gray-600 mb-2">8.10 If You or Your nominee fail, through no fault of Ours, to take delivery of the Goods at the Delivery Location, We may charge the reasonable costs of storing and redelivering them.</p>
            <p className="text-gray-600 mb-6">8.11 The Goods will become Your responsibility from the completion of delivery or Customer Collection. You must, if reasonably practicable, examine the Goods before accepting them.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">9. Risk and Title</h2>
            <p className="text-gray-600 mb-2">9.1 Risk of damage to, or loss of, any Goods will pass to You when the Goods are delivered to You.</p>
            <p className="text-gray-600 mb-6">9.2 You do not own the Goods until We have received payment in full. If full payment is overdue or a step occurs towards your bankruptcy/insolvency, We can choose, by notice to cancel any delivery and end any right You may have to Goods still owned by Us.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">10. Withdrawal, Returns and Cancellation</h2>
            <p className="text-gray-600 mb-2">10.1 You can withdraw the Order by telling us before the Contract is made, if you simply wish to change your mind and without giving us a reason, and without incurring any liability.</p>
            <p className="text-gray-600 mb-2">10.2 This is a Distance Contract (as defined below) which has the cancellation rights ("Cancellation Rights") set out below. These Cancellation Rights, however, do not apply to a contract for the following goods (with no others) in the following circumstances:</p>
            <p className="text-gray-600 mb-2 ml-4">10.2.1 goods that are made to your specifications or are clearly personalized;</p>
            <p className="text-gray-600 mb-2 ml-4">10.2.2 goods which are liable to deteriorate or expire rapidly.</p>
            <p className="text-gray-600 mb-6">10.3 Also, the Cancellation Rights for a Contract cease to be available in the following circumstances: in the case of any Sales Contract, if the goods become mixed inseparably (according to their nature) with other items after delivery.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">11. Consumer's right to cancel</h2>
            <p className="text-gray-600 mb-2">11.1 If You are a Consumer You can cancel the Contract within 14 days ("Cancellation Period") without giving any reason.</p>
            <p className="text-gray-600 mb-2">11.2 The Cancellation Period will expire after 14 days from the day on which You acquire, or a third party, other than the carrier indicated by You, acquires physical possession of the last of the Goods.</p>
            <p className="text-gray-600 mb-2">11.3 To exercise the right to cancel, You must inform Us of Your decision to cancel this Contract by a clear statement setting out Your decision (e.g., a letter sent by post or email). You can use the attached model cancellation form, but it is not obligatory. In any event, You must be able to show clear evidence of when the cancellation was made, so You may decide to use the model cancellation form.</p>
            <p className="text-gray-600 mb-4">11.4 To meet the cancellation deadline, it is sufficient for You to send Your communication concerning Your exercise of the right to cancel before the cancellation period has expired.</p>

            <p className="text-gray-600 font-medium mb-2">Effects of cancellation in the cancellation period</p>
            <p className="text-gray-600 mb-4">11.5 Except as set out below, if You cancel this Contract, We will reimburse to You all payments received from You and the original cost of the least expensive standard delivery within the UK, but excluding the costs of other types of delivery (this means that if You have requested a delivery method that is more expensive than the least expensive standard delivery within the UK or it is a delivery outside the UK, then You will only be reimbursed as for the least expensive standard delivery within the UK).</p>

            <p className="text-gray-600 font-medium mb-2">Deduction for Goods supplied</p>
            <p className="text-gray-600 mb-4">11.6 We may make a deduction from the reimbursement for loss in value of any Goods supplied, if the loss is the result of unnecessary handling by You (i.e., handling the Goods beyond what is necessary to establish the nature, characteristics and functioning of the Goods: e.g., it goes beyond the sort of handling that might be reasonably allowed in a shop). This is because You are liable for that loss and, if that deduction is not made, You must pay Us the amount of that loss.</p>

            <p className="text-gray-600 font-medium mb-2">Timing of reimbursement</p>
            <p className="text-gray-600 mb-2">11.7 If We have not offered to collect the Goods, We will make the reimbursement without undue delay, and not later than:</p>
            <p className="text-gray-600 mb-2 ml-4">11.7.1 14 days after the day We receive back from You any Goods supplied, or</p>
            <p className="text-gray-600 mb-2 ml-4">11.7.2 (if earlier) 14 days after the day You provide evidence that You have sent back the Goods.</p>
            <p className="text-gray-600 mb-4">11.8 If We have offered to collect the Goods or if no Goods were supplied, We will make the reimbursement without undue delay, and not later than 14 days after the day on which We are informed about Your decision to cancel this Contract.</p>
            <p className="text-gray-600 mb-4">11.9 We will make the reimbursement using the same means of payment as You used for the initial transaction, unless You have expressly agreed otherwise; in any event, You will not incur any fees as a result of the reimbursement.</p>

            <p className="text-gray-600 font-medium mb-2">Returning Goods</p>
            <p className="text-gray-600 mb-4">11.10 If You have received Goods in connection with the Contract which You have cancelled, You must send back the Goods or hand them over to Us at Units C & D The Pavilions, 2 East Road, London, SW19 1UW without delay and in any event not later than 14 days from the day on which You communicate to Us Your cancellation of this Contract. The deadline is met if You send back the Goods before the period of 14 days has expired. You agree that You will have to bear all the costs of returning the Goods.</p>
            <p className="text-gray-600 mb-2">11.11 For the purposes of these Cancellation Rights, these words have the following meanings:</p>
            <p className="text-gray-600 mb-2 ml-4">11.11.1 "Distance Contract" means a contract concluded between a trader and a consumer under an organized distance sales or service-provision scheme without the simultaneous physical presence of the trader and the consumer, with the exclusive use of one or more means of distance communication up to and including the time at which the contract is concluded; and</p>
            <p className="text-gray-600 mb-6 ml-4">11.11.2 "Sales Contract" means a contract under which a trader transfers or agrees to transfer the ownership of goods to a consumer and the consumer pays or agrees to pay the price, including any contract that has both goods and services as its object.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">12. Our right to cancel</h2>
            <p className="text-gray-600 mb-2">12.1 IntroCar may cancel Your Order at any time with immediate effect by giving You written notice if:</p>
            <p className="text-gray-600 mb-2 ml-4">12.1.1 You do not pay Us when you should under clause 6. Cancellation does not affect Our right to charge You interest under clause 6; or</p>
            <p className="text-gray-600 mb-2 ml-4">12.1.2 You breach these Terms and Conditions in a material way and You do not remedy the situation within 7 days of Us asking You to in writing (or such longer period as We may specify); or</p>
            <p className="text-gray-600 mb-2 ml-4">12.1.3 You are subject to an Insolvency Event; or</p>
            <p className="text-gray-600 mb-2 ml-4">12.1.4 there is an Force Majeure Event which continues for 60 days or more and is still continuing.</p>
            <p className="text-gray-600 mb-6">12.2 If We cancel an Order under clause 13.1.1 You must still pay IntroCar in the same manner and extent as provided in clauses 7.4 or 7.5 (as applicable).</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">13. Conformity, Warranty and Guarantee</h2>
            <p className="text-gray-600 mb-2">13.1 Upon delivery, the Goods will:</p>
            <p className="text-gray-600 mb-2 ml-4">13.1.1 be of satisfactory quality;</p>
            <p className="text-gray-600 mb-2 ml-4">13.1.2 be reasonably fit for any particular purpose for which you buy the Goods which, before the Contract is made, you made known to us (unless you do not actually rely, or it is unreasonable for you to rely, on our skill and judgment) and be fit for any purpose held out by us or set out in the Contract; and</p>
            <p className="text-gray-600 mb-2 ml-4">13.1.3 conform to their description.</p>
            <p className="text-gray-600 mb-2">13.3 It is not a failure to conform if the failure has its origin in your materials.</p>
            <p className="text-gray-600 mb-2">13.4 Unless otherwise confirmed by Us in writing, for Goods which are new and genuine Rolls-Royce or Bentley parts, We warrant that those Goods are free from material defects to the extent only that We have the benefit of, and can enforce, a corresponding warranty or guarantee against the manufacturer or Our supplier of the relevant Goods. We shall use Our reasonable efforts to enforce any such guarantee or warranty against the manufacturer or Our supplier and pass any corresponding benefit onto You subject always to You cooperating fully and assisting Us in complying with the terms of any relevant manufacturer or supplier warranty.</p>
            <p className="text-gray-600 mb-2">13.5 For all other Goods i.e., those which are not new and genuine Rolls-Royce and Bentley parts, we warrant that on delivery and for a period of:</p>
            <p className="text-gray-600 mb-2 ml-4">13.5.1 36 months for Goods which are new aftermarket parts named 'Prestige Parts' (not manufactured by the original equipment manufacturer);</p>
            <p className="text-gray-600 mb-2 ml-4">13.5.2 24 months for Goods which are used parts; and</p>
            <p className="text-gray-600 mb-2 ml-4">13.5.3 12 months for Goods which are reconditioned parts.</p>
            <p className="text-gray-600 mb-2">13.6 The warranty does not apply to any defect in the Goods arising from:</p>
            <p className="text-gray-600 mb-2 ml-4">13.6.1 failure to fit the Goods in accordance with the relevant manufacturer's instructions and guidelines;</p>
            <p className="text-gray-600 mb-2 ml-4">13.6.2 fair wear and tear;</p>
            <p className="text-gray-600 mb-2 ml-4">13.6.3 wilful damage, abnormal storage or working conditions, accident, negligence by you or by any third party (including but not limited to insufficient servicing);</p>
            <p className="text-gray-600 mb-2 ml-4">13.6.4 any failure by you or a third party to maintain, operate or use the Goods in accordance with the user instructions; or</p>
            <p className="text-gray-600 mb-2 ml-4">13.6.5 any alteration or repair by you or by a third party who has not been approved by Us beforehand.</p>
            <p className="text-gray-600 mb-2">13.7 Subject to clause 13.6, if:</p>
            <p className="text-gray-600 mb-2 ml-4">13.7.1 you give Us notice in writing during the relevant Warranty Period within a reasonable time of discovery that any Goods do not comply with the warranty set out in clause 13.5;</p>
            <p className="text-gray-600 mb-2 ml-4">13.7.2 We are given a reasonable opportunity of examining such Goods or (at our request) You provide reasonable photographic evidence of the alleged defect(s); and</p>
            <p className="text-gray-600 mb-2 ml-4">13.7.3 You (at Our request) return such Goods to Our place of business at Your cost, We shall, at Our sole option, repair or replace the defective Goods, or refund the price of the defective Goods in full.</p>
            <p className="text-gray-600 mb-2">13.8 We may in Our sole discretion replace any alleged faulty Goods following notice provided by You in accordance with clause 13.7. before we have received and examined the alleged faulty Goods. We shall however be entitled to charge you for any replacement Goods (including any delivery costs etc.) to the extent that:</p>
            <p className="text-gray-600 mb-2 ml-4">13.8.1 we reasonably determine that the alleged faulty Goods do not comply with the warranty at clause 13.5. or that any fault has occurred because of your failure to comply with clause 13.6; or</p>
            <p className="text-gray-600 mb-2 ml-4">13.8.2 the alleged faulty Goods are not received by us within 14 days of receipt of your notice.</p>
            <p className="text-gray-600 mb-2">13.9 These Terms shall apply to any repaired or replacement Goods supplied by Us under clause 13.7.3 save that the Warranty Period shall commence from the delivery of the original Goods supplied to You.</p>
            <p className="text-gray-600 mb-2">13.10 If You are a consumer, this warranty is in addition to, and does not affect, Your legal rights in relation to Goods that are faulty or not as described.</p>
            <p className="text-gray-600 mb-6">13.11 We will provide telephone and email support to the You to ensure accurate identification of parts required for Your specific car model.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">14. Assignment</h2>
            <p className="text-gray-600 mb-6">14.1 You may not transfer the benefit of the Contract to someone else.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">15. Circumstances beyond Our control</h2>
            <p className="text-gray-600 mb-2">15.1 IntroCar will not be liable for any failure to perform, or delay in performance of, any of its obligations under these Terms and Conditions that is caused by circumstances beyond Our control ("Force Majeure Event"). For the purpose of these Terms and Conditions a Force Majeure Event means an act or event beyond IntroCar's reasonable control, including without limitation, riot, invasion, terrorist attack or threat of terrorist attack, war (whether declared or not) or threat of preparation from war, fire, explosion, storm, flood, earthquake, subsidence, epidemic, pandemic or other natural disaster, failure of public or private telecommunications networks, strikes, lock-outs or other industrial action, unavailability or parts or materials or personnel.</p>
            <p className="text-gray-600 mb-6">15.2 If a Force Majeure Event takes place which affects the performance of IntroCar's obligations under these Terms and Conditions We will contact You as soon as reasonably practicable to notify You and Our obligations under these Terms and Conditions will be extended for the duration of the Force Majeure Event.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">16. Privacy</h2>
            <p className="text-gray-600 mb-2">16.1 Your privacy is critical to Us. We respect Your privacy and comply with the General Data Protection Regulation with regard to Your personal information.</p>
            <p className="text-gray-600 mb-2">16.2 These Terms and Conditions should be read alongside, and are in addition to Our policies, including our <a href="/privacy" className="text-introcar-blue hover:underline">privacy policy</a>.</p>
            <p className="text-gray-600 mb-2">16.3 For the purposes of these Terms and Conditions:</p>
            <p className="text-gray-600 mb-2 ml-4">16.3.1 "Data Protection Laws" means any applicable law relating to the processing of Personal Data, including, but not limited to the GDPR.</p>
            <p className="text-gray-600 mb-2 ml-4">16.3.2 "GDPR" means the UK General Data Protection Regulation.</p>
            <p className="text-gray-600 mb-2 ml-4">16.3.3 "Data Controller", "Personal Data" and "Processing" shall have the same meaning as in the GDPR.</p>
            <p className="text-gray-600 mb-2">16.4 We are a Data Controller of the Personal Data We Process in providing Goods and/or Services to You.</p>
            <p className="text-gray-600 mb-2">16.5 Where You supply Personal Data to Us so We can provide Goods and/or Services to You, and We Process that Personal Data in the course of providing the Goods to You, We will comply with Our obligations imposed by the Data Protection Laws:</p>
            <p className="text-gray-600 mb-2 ml-4">16.5.1 before or at the time of collecting Personal Data, We will identify the purposes for which information is being collected;</p>
            <p className="text-gray-600 mb-2 ml-4">16.5.2 We will only Process Personal Data for the purposes identified;</p>
            <p className="text-gray-600 mb-2 ml-4">16.5.3 We will respect your rights in relation to Your Personal Data; and</p>
            <p className="text-gray-600 mb-2 ml-4">16.5.4 We will implement technical and organizational measures to ensure Your Personal Data is secure.</p>
            <p className="text-gray-600 mb-2">16.6 We will use the personal information You provide to Us:</p>
            <p className="text-gray-600 mb-2 ml-4">16.6.1 to supply the Goods to You;</p>
            <p className="text-gray-600 mb-2 ml-4">16.6.2 to process Your payment for the Goods; and</p>
            <p className="text-gray-600 mb-2 ml-4">16.6.3 if You agreed to this during the order process, to give You information about similar Goods that we provide, but You may stop receiving this at any time by contacting Us.</p>
            <p className="text-gray-600 mb-2">16.7 Where We extend credit to You for the Goods and/or Services We may pass Your personal information to credit reference agencies and they may keep a record of any search that they do.</p>
            <p className="text-gray-600 mb-6">16.8 For any enquiries or complaints regarding data privacy, you can e-mail: <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a>.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">17. Excluding liability</h2>
            <p className="text-gray-600 mb-4">17.1 We do not exclude liability for: (i) any fraudulent act or omission; or (ii) for death or personal injury caused by negligence or breach of Our other legal obligations. Subject to this, We are not liable for (i) loss which was not reasonably foreseeable to both parties at the time when the Contract was made, or (ii) loss (e.g., loss of profit) to Your business, trade, craft or profession which would not be suffered by a Consumer - because We believe You are not buying the Goods wholly or mainly for its business, trade, craft or profession.</p>

            <p className="text-gray-600 font-medium mb-2">Our Liability if you are a Business</p>
            <p className="text-gray-600 mb-2">17.2 Nothing in these Terms and Conditions limits or excludes Our liability to the extent that would be unlawful in any relevant jurisdiction nor for:</p>
            <p className="text-gray-600 mb-2 ml-4">17.2.1 death or personal injury caused by our negligence;</p>
            <p className="text-gray-600 mb-2 ml-4">17.2.2 fraud or fraudulent misrepresentation;</p>
            <p className="text-gray-600 mb-2 ml-4">17.2.3 breach of the terms implied by section 12 of the Sale of Goods Act 1979 (title and quiet possession); or</p>
            <p className="text-gray-600 mb-2 ml-4">17.2.4 defective products under the Consumer Protection Act 1987.</p>
            <p className="text-gray-600 mb-2">17.3 Subject to clause 17.2, We will under no circumstances whatsoever be liable to You, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, arising under or in connection with the Contract for:</p>
            <p className="text-gray-600 mb-2 ml-4">17.3.1 any loss of profits, sales, business, or revenue;</p>
            <p className="text-gray-600 mb-2 ml-4">17.3.2 loss or corruption of data, information or software;</p>
            <p className="text-gray-600 mb-2 ml-4">17.3.3 loss of business opportunity;</p>
            <p className="text-gray-600 mb-2 ml-4">17.3.4 loss of anticipated savings;</p>
            <p className="text-gray-600 mb-2 ml-4">17.3.5 loss of goodwill; or</p>
            <p className="text-gray-600 mb-2 ml-4">17.3.6 any indirect or consequential loss.</p>
            <p className="text-gray-600 mb-4">17.4 Subject to clause 17.2, our total liability to You in respect of all losses arising under or in connection with the contract, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, shall in no circumstances exceed the amount paid for the relevant Goods.</p>
            <p className="text-gray-600 mb-4">17.5 Except as expressly stated in these Terms and Conditions, we do not give any representation, warranties or undertakings in relation to the Goods. Any representation, condition or warranty which might be implied or incorporated into these Terms and Conditions by statute, common law or otherwise is excluded to the fullest extent permitted by law. In particular, we will not be responsible for ensuring that the Goods are suitable for Your purposes.</p>

            <p className="text-gray-600 font-medium mb-2">Our Liability if you are a Consumer</p>
            <p className="text-gray-600 mb-2">17.6 If we fail to comply with these Terms and Conditions, we are responsible for loss or damage you suffer that is a foreseeable result of our breach of these Terms and Conditions or our negligence, but we are not responsible for any loss or damage that is not foreseeable. Loss or damage is foreseeable if it is an obvious consequence of our breach or if it was contemplated by you and us at the time we entered into this Terms and Conditions.</p>
            <p className="text-gray-600 mb-2">17.7 We only supply the Goods for domestic and private use. You agree not to use the Goods for any commercial, business or resale purposes, and we have no liability to you for any loss of profit, loss of business, business interruption, or loss of business opportunity.</p>
            <p className="text-gray-600 mb-2">17.8 Notwithstanding anything in these Terms and Conditions, we do not in any way exclude or limit our liability for:</p>
            <p className="text-gray-600 mb-2 ml-4">17.8.1 death or personal injury caused by our negligence;</p>
            <p className="text-gray-600 mb-2 ml-4">17.8.2 fraud or fraudulent misrepresentation;</p>
            <p className="text-gray-600 mb-2 ml-4">17.8.3 defective products under the Consumer Protection Act 1987; or</p>
            <p className="text-gray-600 mb-6 ml-4">17.8.4 any matter in respect of which it would be unlawful for us to exclude or restrict our liability.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">18. General</h2>
            <p className="text-gray-600 mb-2">18.1 These Terms and Conditions are personal to You. No other person shall have any rights to enforce any of the provisions contained within the Terms and Conditions.</p>
            <p className="text-gray-600 mb-2">18.2 If IntroCar fails to insist that You perform any of Your obligations under these Terms and Conditions, or if IntroCar do not enforce Our rights against You, or if IntroCar delays in doing so, that will not mean that IntroCar have waived Our rights against You and will not mean that You do not have to comply with those obligations. If IntroCar do waive a default by You, we will only do so in writing, and that will mean that IntroCar will automatically waive any later default by You.</p>
            <p className="text-gray-600 mb-2">18.3 Each clause of these Terms and Conditions operates separately. If any court or relevant authority decides that any of them is unlawful, the remaining clauses will remain in full force and effect.</p>
            <p className="text-gray-600 mb-6">18.4 To comply with anti-money laundering and counter-terrorist financing regulations, IntroCar may ask you for proof of identity and IntroCar may undertake searches and enquiries for this purpose. If you fail to provide the requested information promptly We may decline, delay or cancel the Order.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">19. Governing law, Jurisdiction and Complaints</h2>
            <p className="text-gray-600 mb-2">19.1 We try to avoid any dispute, so We deal with complaints in the following way: If a dispute occurs You should contact Us to find a solution. We will aim to respond with an appropriate solution within 5 days.</p>
            <p className="text-gray-600 mb-6">19.2 These Terms and Conditions and any Contract shall be governed by English Law and any dispute in connection with them or any claim You may bring against IntroCar (whether in contract or tort) shall subject to the provisions of Clause 19.1 be determined exclusively by the courts of England and Wales to whose jurisdiction we both hereby irrevocably submit.</p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">Model Cancellation Form</h2>
            <div className="bg-introcar-light rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4">
                <strong>To:</strong><br />
                IntroCar Ltd<br />
                Units C & D The Pavilions<br />
                2 East Road, London, SW19 1UW<br />
                Email address: <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a><br />
                Telephone number: +44 (0) 20 8546 2027
              </p>
              <p className="text-gray-700 mb-4">
                I/We[*] hereby give notice that I/We [*] cancel my/our [*] contract of sale of the following goods/for the supply of the following service[*]:
              </p>
              <p className="text-gray-700 mb-4">
                ___________________, ordered on: ___________ and received on: ____________.
              </p>
              <p className="text-gray-700 mb-4">
                Name of consumer(s): _______________________<br />
                Address of consumer(s): ______________________<br />
                Signature of consumer(s) (only if this form is notified on paper)<br />
                Date
              </p>
              <p className="text-gray-700 text-sm">
                [*] Delete as appropriate.
              </p>
            </div>

            <p className="text-gray-600 mb-6">
              These Terms and Conditions are also available to request by email <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a> or telephone +44 (0) 20 8546 2027.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
