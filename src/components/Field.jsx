import React from "react";

const Field = ({ fields }) => {
    return (
        <div className="field">
            {fields.map((row) => {
                return row.map((column, index) => {
                    return <div key={index} className={`dots ${column}`}></div>;
                });
            })}
        </div>
    );
};

export default Field;
