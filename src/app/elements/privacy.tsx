import { PageTitleHeader } from "@pixelated-tech/components";

export default function Privacy() {
	return (
		<>
			<PageTitleHeader title="Privacy Policy" />
			<div className="callout-body">
                All applications created by Pixelated are privacy respecting applications. We go out of our way to keep as little information about users as possible.<br/>
				<br/>
                As part of the onboarding, processing, and usage of our applications, we receive and store minimum amounts of personal information necessary. We store this this information so long as you are using the app and we delete it within 30 days of you uninstalling the app.<br/>
				<br/>
                This information is needed by the applications or third party applications that are integrated to be able to communicate with you.  We also keep a log of server traffic which makes note of the IP address of the requestor, what's being requested and user information if it is available. We record this information purely for troubleshooting and security analysis.  We keep the above log information for a maximum of 30 days and then delete it.<br/>
				<br/>
                Pixelated applications are a serverless applications that runs in a data center hosted by AWS in Ohio. We do not explicitly share anything with Amazon but they could have access to our systems if they chose to. We have no reason nor intention to transfer data outside the US.<br/>
				<br/>
                If you'd like to know more about anything we do with regards to your data, please email us at brian.whaley@pixelated.tech.
				<br/>
			</div>
		</>
	);
}