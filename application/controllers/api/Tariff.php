<?php
class Tariff extends CI_Controller {

    protected $resource = 'https://www.sknt.ru/job/frontend/data.json';

    public function index()
    {
        $data = file_get_contents($this->resource);
		return $this->output
        ->set_content_type('application/json')
        ->set_output($data);
    }

    public function show() {
        $tariff = $this->getTariff();
        return $this->output
        ->set_content_type('application/json')
        ->set_output(json_encode($tariff));
    }

    public function getTariff()
    {
        $name = $this->input->get('name', null);
        $data = file_get_contents($this->resource);
        $data = json_decode($data, true);
        $tariff = [];
        foreach ($data['tarifs'] as $key => $value) {
            if ($value['title'] == $name) {
                $tariff = $value;
                break;
            }
        }
        return $tariff;
    }

    public function version($versionId)
    {
        $tariff = $this->getTariff();
        $version = [];
        foreach ($tariff['tarifs'] as $key => $value) {
            if ($value['ID'] == $versionId) {
                $version = $value;
                break;
            }
        }
        return $this->output
        ->set_content_type('application/json')
        ->set_output(json_encode([
            'tariff' => $tariff,
            'version' => $version,
        ]));
    }
}