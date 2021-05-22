import React from "react";
import "./App.css";
import { Dropdown } from '@fluentui/react/lib/Dropdown';

export default function ByDistrict({ totalSelectedDistricts }) {
    const [states, setStates] = React.useState([]);

    const [districts, setDistricts] = React.useState([[]]);
    const [selectedDistricts, setSelectedDistricts] = React.useState([[]]);

    // number of disabled groups
    const [disabledGroups, setDisabledGroups] = React.useState(0);
    const [totalGroups, setTotalGroups] = React.useState(1);

    React.useEffect(() => {
        fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states")
            .then(res => res.json())
            .then(res => {
                setStates(res.states);
            })
    }, []);

    const getDistricts = (stateId, currentIndex) => {
        fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`)
            .then(res => res.json())
            .then(res => {
                const currentDistricts = districts.slice(0);
                currentDistricts[currentIndex] = res.districts;

                setDistricts(currentDistricts);
            })
    }

    const onStateSelect = (e, item, currentIndex) => {
        const currentSelectedDistricts = selectedDistricts.slice(0);
        currentSelectedDistricts[currentIndex] = [];

        setSelectedDistricts(currentSelectedDistricts);
        totalSelectedDistricts(currentSelectedDistricts.flat());
        getDistricts(item.key, currentIndex);
    }

    const onDistrictChange = (e, item, currentIndex) => {
        if (item) {
            const currentSelectedDistricts = selectedDistricts.slice(0);
            currentSelectedDistricts[currentIndex] = item.selected ? [...currentSelectedDistricts[currentIndex], item.key] : currentSelectedDistricts[currentIndex].filter(key => key !== item.key);

            setSelectedDistricts(currentSelectedDistricts);
            totalSelectedDistricts(currentSelectedDistricts.flat());
        }
    };

    const onMoreClick = () => {
        setDisabledGroups(disabledGroups + 1);
        setTotalGroups(totalGroups + 1);
        setDistricts([...districts, []]);
        setSelectedDistricts([...selectedDistricts, []]);
    }

    return (
        <div className="group column">
            {Array.from(Array(totalGroups), (element, index) => (
                <React.Fragment key={index}>
                    <div className="group">
                        <Dropdown
                            disabled={index < disabledGroups}
                            label="State:"
                            placeholder="Select state"
                            styles={{ dropdown: { minWidth: 300 } }}
                            options={states.map(state => ({ key: state.state_id, text: state.state_name }))}
                            onChange={(e, item) => onStateSelect(e, item, index)}
                        />
                    </div>
                    <div className="group">
                        <Dropdown
                            disabled={index < disabledGroups}
                            label="District:"
                            multiSelect
                            placeholder="Select district(s)"
                            selectedKeys={selectedDistricts[index]}
                            styles={{ dropdown: { minWidth: 300 } }}
                            options={districts[index].map(district => ({ key: district.district_id, text: district.district_name }))}
                            onChange={(e, item) => onDistrictChange(e, item, index)}
                        />
                    </div>
                </React.Fragment>
            ))}

            <button onClick={onMoreClick} disabled={selectedDistricts[totalGroups - 1].length === 0}>Add alerts for more states' districts</button>
        </div>
    );
}
