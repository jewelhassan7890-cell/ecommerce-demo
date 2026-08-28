import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ items }) => {

    if (!items || items.length === 0) {
        return null;
    }

    return (

        <nav className="mb-6">

            <ol className="flex items-center text-sm text-gray-500">

                {items.map((item, index) => {

                    const isLast = index === items.length - 1;

                    return (

                        <li
                            key={item.id}
                            className="flex items-center"
                        >

                            {!isLast ? (

                                <Link
                                    to={item.link}
                                    className="hover:text-blue-600 transition"
                                >
                                    {item.name}
                                </Link>

                            ) : (

                                <span className="font-semibold text-gray-900">
                                    {item.name}
                                </span>

                            )}

                            {!isLast && (
                                <ChevronRight
                                    size={16}
                                    className="mx-2"
                                />
                            )}

                        </li>

                    );

                })}

            </ol>

        </nav>

    );

};

export default Breadcrumb;