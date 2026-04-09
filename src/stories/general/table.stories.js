import { Table } from "@/components/general/table";
import requestData from "@/data/requests.json";
import '@/css/pixelated.global.css';


export default {
	title: 'General',
	component: Table
};

export const Table_Requests = {
	args: {
		data: requestData,
		id: "requestData",
		sortable: true,
	}
};
